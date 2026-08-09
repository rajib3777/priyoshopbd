from django.urls import path
from . import views

urlpatterns = [
    path('excel/orders/', views.OrderExcelExportView.as_view(), name='export_orders_excel'),
    path('pdf/invoice/<int:order_id>/', views.OrderPdfInvoiceView.as_view(), name='export_order_pdf'),
]
