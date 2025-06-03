from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

from .serializers import (ProfileSerializer, CategorySerializer,
                           ProductSerializer, CartSerializer, OrderSerializer, FeedbackSerializer)

from .models import Category, Product, Profile, Cart, Order, Feedback
from django.db import transaction

import random
import time

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.profile.user_type == 'admin'

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            product_id = request.data.get('product_id')
            quantity = request.data.get('quantity', 1)

            # Validate product exists
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

            # Check for existing cart item
            try:
                cart_item = Cart.objects.get(user=request.user, product=product)
                # If exists, update quantity
                cart_item.quantity += int(quantity)
                cart_item.save()
            except Cart.DoesNotExist:
                # If not exists, create new cart item
                cart_item = Cart.objects.create(
                    user=request.user,
                    product=product,
                    quantity=int(quantity)
                )

            serializer = self.get_serializer(cart_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error in CartViewSet.create: {str(e)}")  # Debug log
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['patch'], url_path='update-quantity')
    def update_quantity(self, request, pk=None):
        try:
            cart_item = self.get_object()
            quantity = request.data.get('quantity')
            if quantity is None or quantity <= 0:
                return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.quantity = quantity
            cart_item.save()
            serializer = self.get_serializer(cart_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
                print(f"Error in CartViewSet.update_quantity: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_item(self, request, pk=None):
        try:
            cart_item = self.get_object()
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error in CartViewSet.delete_item: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all orders, users see only their own
        if self.request.user.profile.user_type == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set user to the authenticated user
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        try:
            with transaction.atomic():
                cart_items = Cart.objects.filter(user=request.user)
                if not cart_items.exists():
                    return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
                
                for cart in cart_items:
                    # Create order for each cart item
                    Order.objects.create(
                        user=request.user,
                        product=cart.product,
                        quantity=cart.quantity,
                        status='pending'
                    )
                # Remove all cart items after order creation
                cart_items.delete()  # Fixed from cart.delete()
                return Response({"message": "Order placed successfully, proceed to payment"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error in OrderViewSet.checkout: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='order-history')
    def order_history(self, request):
        try:
            orders = self.get_queryset().order_by('-created_at')
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in OrderViewSet.order_history: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'], url_path='process-payment')
    def process_payment(self, request, pk=None):
        try:
            print(f"User: {request.user.username}, Is admin: {request.user.profile.user_type == 'admin'}")
            order = self.get_object()
            print(f"Before payment - Order {order.id} status: {order.status}, Owner: {order.user.username}")
            
            # Simulate network delay
            time.sleep(1)
            
            # Forced success for testing
            payment_success = True
            print(f"Payment success: {payment_success}")
            
            if payment_success:
                try:
                    # Update order status
                    order.status = 'shipped'
                    order.save(update_fields=['status'])
                    
                    # Verify the update
                    order.refresh_from_db()
                    print(f"After save - Order {order.id} status: {order.status}")
                    
                    if order.status != 'shipped':
                        raise Exception(f"Status update failed for Order {order.id}, still {order.status}")
                    
                    return Response({"message": "Payment successful, order shipped"}, status=status.HTTP_200_OK)
                except Exception as save_error:
                    print(f"Save error for Order {order.id}: {str(save_error)}")
                    return Response({"error": "Failed to update order status"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print(f"Payment failed for Order {order.id}")
                return Response({"error": "Payment failed, please try again"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in OrderViewSet.process_payment: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({"message": "Feedback submitted successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)