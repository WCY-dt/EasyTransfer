declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare let SvgIcon: import('vue').DefineComponent<{
  type: {
    type: StringConstructor
    default: string
  }
  path: {
    type: StringConstructor
    default: string
  }
  size: {
    type: StringConstructor
    optional: boolean
  }
  viewbox: {
    type: StringConstructor
    optional: boolean
  }
  flip: {
    type: StringConstructor
    optional: boolean
  }
  rotate: {
    type: StringConstructor
    optional: boolean
  }
}>

declare module '@jamescoyle/vue-icon' {
  export default SvgIcon
}
