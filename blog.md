---
layout: page
title: "Posts and Writings"
nav_order: 1
---

{% for post in site.posts %}
  <p>
    <span>{{ post.date | date: "%b %-d, %Y" }}</span> — 
    <a href="{{ post.url }}">{{ post.title }}</a>
  </p>
{% endfor %}
