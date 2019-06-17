from rest_framework import fields as drf_fields, serializers


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


class SerializerSerializer(serializers.BaseSerializer):

    def __init__(self, serializer=None, data=drf_fields.empty, read_only=None, flat=False, **kwargs):
        self.read_only = read_only
        self.flat = flat
        super().__init__(instance=serializer, data=data)

    def get_field_type(self, field):
        typ = 'text'
        if isinstance(field, drf_fields.DateField):
            typ = 'date'
        elif isinstance(field, drf_fields.DateTimeField):
            typ = 'datetime'
        elif 'password' in field.field_name:
            typ = 'password'
        return typ

    def field_to_struct(self, field, nested_path):
        ret = {
            'label': field.label,
            'type': self.get_field_type(field),
        }
        return ret

    # See representation.serializer_repr().
    def serializer_to_struct(self, serializer, base_path='', force_many=None):
        if force_many:
            fields = force_many.fields
        else:
            fields = serializer.fields
        ret = []
        for field_name, field in fields.items():
            if self.read_only is not None and field.read_only != self.read_only:
                continue
            if base_path == '':
                nested_path = field_name
            else:
                nested_path = base_path + '.' + field_name
            if hasattr(field, 'fields'):
                field_data = self.serializer_to_struct(field, nested_path)
            elif hasattr(field, 'child'):
                child = field.child
                if hasattr(child, 'fields'):
                    field_data = self.serializer_to_struct(serializer, nested_path, force_many=child)
                else:
                    field_data = self.field_to_struct(field, nested_path)
            elif hasattr(field, 'child_relation'):
                field_data = self.serializer_to_struct(field.child_relation, nested_path, force_many=field.child_relation)
            else:
                field_data = self.field_to_struct(field, nested_path)
            if self.flat:
                if isinstance(field_data, list):
                    ret.extend(field_data)
                else:
                    field_data['name'] = field_name if self.flat else nested_path
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
