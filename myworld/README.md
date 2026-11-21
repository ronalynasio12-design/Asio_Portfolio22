# Ronalyn Caabay Asio: portfolio (Django)

A single scrolling page: your portrait zooms in as you scroll, blurred glossy 3D tiles drift
past, then the About / Work / Toolkit / Contact sheet slides over the top.

## Run it

```
cd path\to\myworld
python -m venv venv
venv\Scripts\activate          # Windows  (macOS/Linux: source venv/bin/activate)
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate       # includes a small migration that moves project image paths
python manage.py createsuperuser
python manage.py runserver
```

Open http://127.0.0.1:8000/ (admin: http://127.0.0.1:8000/admin/)

## Swap in your own images

All images live in `pages/static/site/img/`. Replace a file and keep the same name:

| File                  | Used for                                              |
| --------------------- | ----------------------------------------------------- |
| `hero.png`           |  Full-body photo in About (transparent cut-out)         |
| `fullbody.png`       |  Big first-page portrait (transparent cut-out)        |
| `hobby-watching.png`    | Hobby collage (placeholder now, transparent PNG best) |
| `hobby-volleyball.png` | Hobby collage (placeholder now)                       |
| `hobby-eating.png`       | Hobby collage (placeholder now)                       |

If you use a different file name or type, update the paths in `pages/portfolio_data.py`
(`HOBBIES`) or the `<img>` tags in `templates/home.html`.

## Editing content

| What                                  | Where                                                     |
| ------------------------------------- | --------------------------------------------------------- |
| Projects (name, role, tech, links)    | Django admin -> Projects                                  |
| Messages from the contact form        | Django admin -> Contact messages                          |
| Headline, about text, hobbies, skills | `pages/portfolio_data.py`                                 |
| Resume link                           | `RESUME_URL` in `pages/portfolio_data.py`                 |
| Colors, fonts, spacing                | top of `pages/static/site/css/site.css`                   |
| Scroll zoom length                    | `style="--zoom: 150"` on `.hero` in `templates/home.html` |

## Deploying

Set these environment variables on your host, then run `python manage.py collectstatic --noinput`
and serve with `gunicorn django_project.wsgi` (whitenoise serves the static files):

```
DJANGO_SECRET_KEY=<a long random string>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```
