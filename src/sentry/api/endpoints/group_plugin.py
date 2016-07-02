from __future__ import absolute_import

from rest_framework.response import Response

from sentry.api.bases.group import GroupEndpoint
from sentry.api.serializers import serialize
from sentry.models import GroupMeta
from sentry.plugins import plugins
from sentry.plugins.base import JSONResponse


class GroupPluginEndpoint(GroupEndpoint):
    ACTIONS = ('create', 'link', 'unlink')

    def _handle(self, request, group, action, slug):
        if action not in self.ACTIONS:
            return Response({'message': 'Unsupported action'})
        try:
            plugin = plugins.get(slug)
        except KeyError:
            return Response({'message': 'Plugin not found'})

        GroupMeta.objects.populate_cache([group])
        if action == 'create':
            return plugin.view_create(request, group)
        elif action == 'unlink':
            return plugin.view_unlink(request, group)
        else:
            return plugin.view_link(request, group)

    def get(self, request, group, action, slug):
        return self._handle(request, group, action, slug)

    def post(self, request, group, action, slug):
        return self._handle(request, group, action, slug)
