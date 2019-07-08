from django.db.utils import OperationalError
from django.utils.translation import gettext as _

from rest_framework.settings import api_settings
from rest_framework.utils import humanize_datetime
from rest_framework import fields as drf_fields, serializers


class DynamicChoiceField(serializers.ChoiceField):

    def __init__(self, *args, get_choices, **kwargs):
        try:
            kwargs['choices'] = get_choices()
        except OperationalError:
            kwargs['choices'] = []
        super().__init__(*args, **kwargs)


# https://medium.com/django-rest-framework/dealing-with-unique-constraints-in-nested-serializers-dade33b831d9
# https://stackoverflow.com/questions/36327029/model-with-this-field-already-exist-on-put-call-django-rest-framework
class OptionalValidationSerializer(serializers.ModelSerializer):
    """
    Allows to disable unique validation when posting to nested serializer.
    Retrieve / list operation does not hide the fields.
    """

    def __init__(self, *args, skip_validation=None, **kwargs):
        self.skip_validation = [] if skip_validation is None else skip_validation
        super().__init__(*args, **kwargs)

    def get_extra_kwargs(self):
        extra_kwargs = super().get_extra_kwargs()
        for skip_field in self.skip_validation:
            if skip_field in extra_kwargs and 'validators' in extra_kwargs[skip_field]:
                extra_kwargs[skip_field]['validators'] = []
        return extra_kwargs


# https://www.django-rest-framework.org/api-guide/serializers/#dynamically-modifying-fields
class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    Allows to optionally hide fields for nested serializer.
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class FieldSerializer:

    def __init__(self, parent, field, field_path):
        self.parent = parent
        self.field = field
        self.field_path = field_path

    def get_field_label(self):
        return self.parent.labels.get(self.field_path, _(self.field.label))

    def to_email(self):
        return {'type': 'email'}

    def get_select_options(self):
        options = [{
            'val': '',
            'text': '',
        }] if self.parent.add_empty_option else []
        for choice in self.field.choices.items():
            choice_val, choice_text = choice
            options.append({
                'val': choice_val,
                'text': choice_text,
            })
        return options

    def to_select(self):
        return {
            'type': 'select',
            'options': self.get_select_options(),
        }

    def get_date_format(self):
        input_formats = getattr(self.field, 'input_formats', api_settings.DATE_INPUT_FORMATS)
        return humanize_datetime.date_formats(input_formats)

    def to_date(self):
        return {
            'type': 'date',
            'format': self.get_date_format(),
        }

    def to_datetime(self):
        return {
            'type': 'datetime',
            'format': self.get_date_format(),
        }

    def to_password(self):
        return {'type': 'password'}

    def to_textarea(self):
        return {'type': 'textarea'}

    def to_text(self):
        return {'type': 'text'}

    def to_struct(self):
        if isinstance(self.field, drf_fields.EmailField):
            ret = self.to_email()
        elif isinstance(self.field, drf_fields.ChoiceField):
            ret = self.to_select()
        elif isinstance(self.field, drf_fields.DateField):
            ret = self.to_date()
        elif isinstance(self.field, drf_fields.DateTimeField):
            ret = self.to_datetime()
        elif 'password' in self.field.field_name:
            ret = self.to_password()
        elif hasattr(self.field, '_kwargs') and \
                self.field._kwargs.get('style', {}).get('base_template') == 'textarea.html':
            ret = self.to_textarea()
        else:
            ret = self.to_text()
        ret['label'] = self.get_field_label()
        return ret


class SerializerSerializer(serializers.BaseSerializer):

    labels = {}
    skip_field_path = []
    field_serializer = FieldSerializer
    serializer_serializer = None
    add_empty_option = True

    def __init__(
            self, serializer=None, data=drf_fields.empty, flat=False, skip_field_path=None, read_only=False, **kwargs
    ):
        self.flat = flat
        if skip_field_path is None:
            self.skip_field_path = self.get_skipped_field_path()
        self.read_only = read_only
        super().__init__(instance=self.get_instance() if serializer is None else serializer, data=data, **kwargs)

    def get_skipped_field_path(self):
        return self.skip_field_path

    def get_instance(self):
        return self.serializer_serializer()

    def skip_field(self, field, field_path):
        return field_path in self.skip_field_path or \
            (self.read_only is not None and field.read_only != self.read_only)

    def get_field_serializer(self, field, field_path):
        return self.field_serializer(parent=self, field=field, field_path=field_path)

    def field_to_struct(self, field, field_path):
        field_serializer = self.get_field_serializer(field, field_path)
        ret = field_serializer.to_struct()
        return ret

        # See representation.serializer_repr().
    def serializer_to_struct(self, serializer, base_path='', force_many=None):
        if force_many:
            fields = force_many.fields
        else:
            fields = serializer.fields
        ret = []
        for field_name, field in fields.items():
            if base_path == '':
                field_path = field_name
            else:
                field_path = base_path + '.' + field_name
            if self.skip_field(field, field_path):
                continue
            if hasattr(field, 'fields'):
                field_data = self.serializer_to_struct(field, field_path)
            elif hasattr(field, 'child'):
                child = field.child
                if hasattr(child, 'fields'):
                    field_data = self.serializer_to_struct(serializer, field_path, force_many=child)
                else:
                    field_data = self.field_to_struct(field, field_path)
            elif hasattr(field, 'child_relation'):
                field_data = self.serializer_to_struct(field.child_relation, field_path, force_many=field.child_relation)
            else:
                field_data = self.field_to_struct(field, field_path)
            if self.flat:
                if isinstance(field_data, list):
                    ret.extend(field_data)
                else:
                    field_data['name'] = field_path if self.flat else field_name
                    ret.append(field_data)
            else:
                if isinstance(field_data, list):
                    field_data = {'relation': field_data}
                field_data['name'] = field_name
                ret.append(field_data)
        return ret

    def to_representation(self, serializer):
        ret = self.serializer_to_struct(serializer)
        return ret
