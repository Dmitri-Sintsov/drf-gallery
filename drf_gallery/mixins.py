from rest_framework import mixins
from rest_framework.decorators import action


class SelectListMixin(mixins.ListModelMixin):

    select_key = None

    @action(detail=False, methods=['get', 'post'])
    def select_list(self, request, *args, **kwargs):
        response = self.list(request, *args, **kwargs)
        response.data = {
            '_view': [
                {
                    'updateData': {
                        'select': {
                            self.select_key: response.data,
                        }
                    }
                }
            ]
        }
        return response
