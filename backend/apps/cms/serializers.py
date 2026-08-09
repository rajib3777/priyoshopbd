from rest_framework import serializers
from apps.cms.models import CMSPage, Menu, MenuItem


class CMSPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CMSPage
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ['id', 'label', 'url', 'category', 'cms_page', 'icon', 'sort_order', 'is_active', 'open_in_new_tab', 'badge_text', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return MenuItemSerializer(obj.children.filter(is_active=True), many=True).data
        return []


class MenuSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Menu
        fields = ['id', 'name', 'slug', 'is_active', 'items']

    def get_items(self, obj):
        top_level = obj.items.filter(parent=None, is_active=True)
        return MenuItemSerializer(top_level, many=True).data
