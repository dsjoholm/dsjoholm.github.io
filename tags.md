---
layout: page
title: Tags
permalink: /tags/
nav_exclude: true
---

{% assign tags = site.tags | sort %}

<div class="tags-archive">
  {% for tag in tags %}
    {% assign tag_name = tag[0] %}
    {% assign posts = tag[1] %} 
    <h2 id="{{ tag_name | slugize }}">{{ tag_name | capitalize }} ({{ posts.size }})</h2>
    <ul>
      {% for post in posts %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <small>({{ post.date | date: "%B %d, %Y" }})</small>
        </li>
      {% endfor %}
    </ul>
    <hr class="slender">
  {% endfor %}
</div>
