from django import forms


class LoginForm(forms.Form):
    username = forms.CharField(
        label='username',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Username',
            'unique': ''
        }),
        error_messages={
            'required': '帳號不能空白'
        }
    )

    password = forms.CharField(
        label='password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Password'
        }),
        error_messages={
            'required': '密碼不能空白'
        }
    )

