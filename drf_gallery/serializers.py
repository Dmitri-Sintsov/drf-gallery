from rest_framework import serializers


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
