
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),

    # React Login and Register pages
    # React Login, Register, and Dealership pages
    path('login/', TemplateView.as_view(template_name='index.html'), name='login-page'),
    path('register/', TemplateView.as_view(template_name='index.html'), name='register-page'),
    path('dealers/', TemplateView.as_view(template_name='index.html'), name='dealers-page'),
    path('dealer/<int:dealer_id>/', TemplateView.as_view(template_name='index.html'), name='dealer-page'),
    path('postreview/<int:dealer_id>/', TemplateView.as_view(template_name='index.html'), name='postreview-page'),

    # Homepage
    path('', TemplateView.as_view(template_name='Home.html'), name='home'),

    # About and Contact pages
    path('about', TemplateView.as_view(template_name='About.html'), name='about'),
    path('contact', TemplateView.as_view(template_name='Contact.html'), name='contact'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
