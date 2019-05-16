from rest_framework import serializers


# https://medium.com/django-rest-framework/dealing-with-unique-constraints-in-nested-serializers-dade33b831d9
# https://stackoverflow.com/questions/36327029/model-with-this-field-already-exist-on-put-call-django-rest-framework
class OptionalValidationSerializer(serializers.ModelSerializer):

    def __init__(self, *args, skip_validation=None, **kwargs):
        self.skip_validation = [] if skip_validation is None else skip_validation
        super().__init__(*args, **kwargs)

    def get_extra_kwargs(self):
        extra_kwargs = super().get_extra_kwargs()
        for skip_field in self.skip_validation:
            if skip_field in extra_kwargs and 'validators' in extra_kwargs[skip_field]:
                extra_kwargs[skip_field]['validators'] = []
        return extra_kwargs
