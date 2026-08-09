from django.urls import path
from . import views
from apps.homepage.views import HeroSlideListView, HeroSlideDetailView

urlpatterns = [
    path('', views.PromotionListView.as_view(), name='promotion_list'),
    path('<int:id>/', views.PromotionDetailView.as_view(), name='promotion_detail'),

    # Hero Banner Slides
    path('hero-slides/', HeroSlideListView.as_view(), name='hero_slide_list'),
    path('hero-slides/<int:id>/', HeroSlideDetailView.as_view(), name='hero_slide_detail'),

    # Deals & Offers Cards
    path('deal-cards/', views.DealOfferCardListView.as_view(), name='deal_card_list'),
    path('deal-cards/<int:id>/', views.DealOfferCardDetailView.as_view(), name='deal_card_detail'),
]
