import mimetypes
import os
import posixpath
from pathlib import Path


from django.http import (
    FileResponse, Http404, HttpResponseNotModified,
)
from django.utils._os import safe_join
from django.utils.http import http_date
from django.conf import settings
from django.views.static import directory_index, was_modified_since
from django.contrib.staticfiles import finders
from django.contrib.staticfiles.handlers import StaticFilesHandler
from django.contrib.staticfiles.management.commands import runserver


DENO_INSTALL = os.getenv('DENO_INSTALL')
rollup_hint = [b'"use rollup"', b"'use rollup"]


# from django.views.static import serve
def serve_rollup(request, path, document_root=None, show_indexes=False):
    """
    Serve static files below a given point in the directory structure.

    To use, put a URL pattern such as::

        from django.views.static import serve

        path('<path:path>', serve, {'document_root': '/path/to/my/files/'})

    in your URLconf. You must provide the ``document_root`` param. You may
    also set ``show_indexes`` to ``True`` if you'd like to serve a basic index
    of the directory.  This index view will use the template hardcoded below,
    but if you'd like to override it, you can create a template called
    ``static/directory_index.html``.
    """
    path = posixpath.normpath(path).lstrip('/')
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_dir():
        if show_indexes:
            return directory_index(path, fullpath)
        raise Http404(_("Directory indexes are not allowed here."))
    if not fullpath.exists():
        raise Http404(_('“%(path)s” does not exist') % {'path': fullpath})
    # Respect the If-Modified-Since header.
    statobj = fullpath.stat()
    """
    if not was_modified_since(request.META.get('HTTP_IF_MODIFIED_SINCE'),
                              statobj.st_mtime, statobj.st_size):
        return HttpResponseNotModified()
    """
    content_type, encoding = mimetypes.guess_type(str(fullpath))
    content_type = content_type or 'application/octet-stream'
    if content_type == "application/javascript":
        with fullpath.open('rb') as f:
            hint = f.read(len(rollup_hint[0]))
            if hint in rollup_hint:
                pass
            else:
                pass
    response = FileResponse(fullpath.open('rb'), content_type=content_type)
    response["Last-Modified"] = http_date(statobj.st_mtime)
    if encoding:
        response["Content-Encoding"] = encoding
    return response


# from django.contrib.staticfiles.views import serve
def serve(request, path, insecure=False, **kwargs):
    """
    Serve static files below a given point in the directory structure or
    from locations inferred from the staticfiles finders.

    To use, put a URL pattern such as::

        from django.contrib.staticfiles import views

        path('<path:path>', views.serve)

    in your URLconf.

    It uses the django.views.static.serve() view to serve the found files.
    """
    if not settings.DEBUG and not insecure:
        raise Http404
    normalized_path = posixpath.normpath(path).lstrip('/')
    absolute_path = finders.find(normalized_path)
    if not absolute_path:
        if path.endswith('/') or path == '':
            raise Http404("Directory indexes are not allowed here.")
        raise Http404("'%s' could not be found" % path)
    document_root, path = os.path.split(absolute_path)
    return serve_rollup(request, path, document_root=document_root, **kwargs)


class RollupFilesHandler(StaticFilesHandler):

    def serve(self, request):
        """Serve the request path."""
        return serve(request, self.file_path(request.path), insecure=True)


class Command(runserver.Command):

    def get_handler(self, *args, **options):
        """
        Return the static files serving handler wrapping the default handler,
        if static files should be served. Otherwise return the default handler.
        """
        handler = super().get_handler(*args, **options)
        use_static_handler = options['use_static_handler']
        insecure_serving = options['insecure_serving']
        if use_static_handler and (settings.DEBUG or insecure_serving):
            return RollupFilesHandler(handler)
        return handler
