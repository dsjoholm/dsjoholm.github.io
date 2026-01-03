---
layout: full-width
title: "Blog1"
nav_order: 1
---

# My Blog

{% for post in site.posts %}
  <p>
    <span>{{ post.date | date: "%b %-d, %Y" }}</span> — 
    <a href="{{ post.url }}">{{ post.title }}</a>
  </p>
{% endfor %}
