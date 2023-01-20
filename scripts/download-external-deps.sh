#!/bin/bash

DIR=output/npm/dist/deps

mkdir -p $DIR
echo '' >$DIR/laconic-ui.deps.js
for i in  \
    "https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" \
    "https://cdn.jsdelivr.net/npm/vue-router/dist/vue-router.js" \
    "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js" \
    "https://cdn.jsdelivr.net/npm/eev@0.1.5/eev.min.js"; do

    wget -q -O - $i >> $DIR/laconic-ui.deps.js
    echo "" >> $DIR/laconic-ui.deps.js
done

echo '' >$DIR/laconic-ui.deps.css
for i in  \
    "https://cdn.jsdelivr.net/npm/vuetify@1.5.24/dist/vuetify.min.css" \
    "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css"; do

    wget -q -O - $i >> $DIR/laconic-ui.deps.css
    echo "" >> $DIR/laconic-ui.deps.css
done
