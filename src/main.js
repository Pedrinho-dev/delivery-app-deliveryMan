import { createApp } from 'vue'
import App from './App.vue'

import router from './router'   // <-- Router

// ----- Vuetify -----
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives
})
// --------------------

createApp(App)
  .use(router)    // <-- coloque primeiro ou depois, tanto faz
  .use(vuetify)   // <-- também precisa estar aqui!
  .mount('#app')