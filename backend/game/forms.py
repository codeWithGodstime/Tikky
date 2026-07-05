import re
from uuid import UUID

from django import forms


USERNAME_PATTERN = re.compile(r"^\w+$")


class UsernameForm(forms.Form):
    username = forms.CharField(
        max_length=32,
        widget=forms.TextInput(attrs={
            "class": (
                "bg-transparent border-none focus:ring-0 w-full font-label-md "
                "text-label-md placeholder:text-surface-container-highest uppercase"
            ),
            "placeholder": "ENTER CALLSIGN",
            "autocomplete": "off",
        }),
    )

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        if not username:
            raise forms.ValidationError("Username is required.")
        if not USERNAME_PATTERN.match(username):
            raise forms.ValidationError("Use letters, numbers, and underscores only.")
        return username


class JoinLobbyForm(UsernameForm):
    game_id = forms.CharField(
        max_length=36,
        widget=forms.TextInput(attrs={
            "class": (
                "bg-transparent border-none focus:ring-0 w-full font-label-md "
                "text-label-md placeholder:text-surface-container-highest uppercase"
            ),
            "placeholder": "ENTER ROOM CODE",
            "autocomplete": "off",
        }),
    )

    def clean_game_id(self):
        game_id = self.cleaned_data["game_id"].strip()
        try:
            UUID(game_id)
        except ValueError as exc:
            raise forms.ValidationError("Enter a valid room code (full game UUID).") from exc
        return game_id
