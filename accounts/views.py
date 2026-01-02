from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def register_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=username).exists():
            return render(request, "accounts/register.html", {
                "error": "Username already exists"
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        login(request, user)
        return redirect("home")   # your home page

    return render(request, "accounts/register.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect("home")
        else:
            return render(request, "accounts/login.html", {
                "error": "Invalid credentials"
            })

    return render(request, "accounts/login.html")


def logout_view(request):
    logout(request)
    return redirect("login")
