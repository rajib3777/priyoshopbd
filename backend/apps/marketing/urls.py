from django.urls import path
from . import views

urlpatterns = [
    path('campaigns/', views.MarketingCampaignListCreateView.as_view(), name='marketing_campaigns'),
    path('campaigns/<int:id>/', views.MarketingCampaignDetailView.as_view(), name='marketing_campaign_detail'),
]
