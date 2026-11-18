from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet,CommentViewSet

router = DefaultRouter() #You create a router object provided by Django REST Framework.
#defaultrouter can automatically generate url patterns for a viewset
#We're creating a router object.Think of this object as a URL manager. It will keep track of the routes we register.
router.register('tasks',TaskViewSet) #"We're telling the router"

"Create URL patterns for the resource called tasks and connect those URLs to TaskViewSet."

urlpatterns = [
    path('',include(router.urls)),
    # path()
]