<script setup></script>

<template>
  <router-view />
</template>

<style>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --text-on-dark: #ffffff;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  overflow-x: hidden;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center / cover no-repeat fixed;
  color: var(--text-on-dark);
}
html,
body {
  overflow-y: hidden;
}
</style>
