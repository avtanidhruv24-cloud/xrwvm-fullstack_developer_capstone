
import json
import logging

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

from .restapis import (
    get_request,
    analyze_review_sentiments,
    post_review,
)

logger = logging.getLogger(__name__)


# -------------------- AUTHENTICATION --------------------

@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("userName", "").strip()
        password = data.get("password", "")

        user = authenticate(
            request, username=username, password=password
        )

        if user is not None:
            login(request, user)
            return JsonResponse({
                "userName": username,
                "status": "Authenticated"
            })

        return JsonResponse({
            "userName": username,
            "status": "Invalid credentials"
        }, status=401)

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid JSON data"}, status=400)


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("userName", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirmPassword", "")

        if not username or not password:
            return JsonResponse({
                "error": "Username and password are required"
            }, status=400)

        if password != confirm_password:
            return JsonResponse({
                "error": "Passwords do not match"
            }, status=400)

        if len(password) < 8:
            return JsonResponse({
                "error": "Password must contain at least 8 characters"
            }, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                "error": "Username already exists"
            }, status=409)

        User.objects.create_user(username=username, password=password)

        return JsonResponse({
            "status": "Registration successful",
            "userName": username
        }, status=201)

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid JSON data"}, status=400)


# -------------------- DEALERSHIP APIs --------------------

def get_dealerships(request, state="All"):
    try:
        if state.lower() == "all":
            dealerships = get_request("fetchDealers")
        else:
            dealerships = get_request(f"fetchDealers/{state}")

        return JsonResponse({
            "status": 200,
            "dealers": dealerships
        })

    except Exception as error:
        logger.exception("Unable to fetch dealerships")
        return JsonResponse({
            "status": 500,
            "error": str(error)
        }, status=500)


def get_dealer_details(request, dealer_id):
    try:
        dealership = get_request(f"fetchDealer/{dealer_id}")

        if not dealership:
            return JsonResponse({
                "status": 404,
                "error": "Dealership not found"
            }, status=404)

        # The Node.js endpoint returns an array containing the dealer.
        dealer = dealership[0] if isinstance(dealership, list) else dealership

        return JsonResponse({
            "status": 200,
            "dealer": dealer
        })

    except Exception as error:
        logger.exception("Unable to fetch dealership details")
        return JsonResponse({
            "status": 500,
            "error": str(error)
        }, status=500)


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f"fetchReviews/dealer/{dealer_id}")

        for review in reviews:
            sentiment = analyze_review_sentiments(
                review.get("review", "")
            )
            review["sentiment"] = sentiment

        return JsonResponse({
            "status": 200,
            "reviews": reviews
        })

    except Exception as error:
        logger.exception("Unable to fetch dealer reviews")
        return JsonResponse({
            "status": 500,
            "error": str(error)
        }, status=500)


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 401,
            "error": "Please log in before submitting a review"
        }, status=401)

    try:
        data = json.loads(request.body)

        # Use the identity of the authenticated Django user.
        data["name"] = request.user.username

        result = post_review(data)

        return JsonResponse({
            "status": 200,
            "message": "Review submitted successfully",
            "result": result
        })

    except (json.JSONDecodeError, TypeError):
        return JsonResponse({
            "status": 400,
            "error": "Invalid JSON data"
        }, status=400)

    except Exception as error:
        logger.exception("Unable to submit review")
        return JsonResponse({
            "status": 500,
            "error": str(error)
        }, status=500)


# -------------------- CAR API --------------------

def get_cars(request):
    try:
        cars = get_request("fetchCars")
        return JsonResponse({
            "status": 200,
            "cars": cars
        })

    except Exception as error:
        logger.exception("Unable to fetch cars")
        return JsonResponse({
            "status": 500,
            "error": str(error)
        }, status=500)
