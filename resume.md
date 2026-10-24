---
layout: page
title: CV
---
{% assign cv = site.data.cv %}

<nav class="cv-documents">
  {% for doc in cv.documents %}<a href="{{ doc.url }}">[{{ doc.title }}]</a>
  {% endfor %}
</nav>

<section class="cv-section">
  <h2>Education</h2>
  {% for item in cv.education %}
  <div class="cv-entry">
    <div class="cv-head">
      <span class="cv-org">{{ item.school }}{% if item.location %} <span class="cv-location">{{ item.location }}</span>{% endif %}</span>
      {% if item.dates %}<span class="cv-dates">{{ item.dates }}</span>{% endif %}
    </div>
    <h3 class="cv-role">{{ item.degree }}</h3>
    {% if item.description %}<div class="cv-desc">{{ item.description | markdownify }}</div>{% endif %}
    {% if item.courses %}<p class="cv-courses">courses: {{ item.courses }}</p>{% endif %}
  </div>
  {% endfor %}
</section>

<section class="cv-section">
  <h2>Experience</h2>
  {% for item in cv.experience %}
  <div class="cv-entry">
    <div class="cv-head">
      <span class="cv-org">{{ item.org }}{% if item.location %} <span class="cv-location">{{ item.location }}</span>{% endif %}</span>
      {% if item.dates %}<span class="cv-dates">{{ item.dates }}</span>{% endif %}
    </div>
    <h3 class="cv-role">{{ item.role }}</h3>
    {% if item.description %}<div class="cv-desc">{{ item.description | markdownify }}</div>{% endif %}
  </div>
  {% endfor %}
</section>

<section class="cv-section" id="projects">
  <h2>Projects</h2>
  {% for item in cv.projects %}
  <div class="cv-entry" id="{{ item.title | slugify }}">
    <div class="cv-head">
      <span class="cv-org">{{ item.context }}</span>
    </div>
    <h3 class="cv-role"><a href="{{ item.url }}">{{ item.title }}</a></h3>
    {% if item.description %}<div class="cv-desc">{{ item.description | markdownify }}</div>{% endif %}
  </div>
  {% endfor %}
</section>
