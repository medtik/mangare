<template>
  <div class="search-container" :class="searchContainerClass">
    <input :disabled="disabled"
           autocomplete="off"
           id="search-input"
           v-model="model"
           name="query"
           type="text"
           @focus="searchFocused = true"
           @blur="searchFocused = false"
           @input="onInput"
    >
    <label for="search-input">
      <span>{{ label }}</span>
    </label>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

export default {
  props: {
    disabled: Boolean,
    value: {
      type: String,
      required: true,
      twoWay: true
    }
  },
  data () {
    return {
      searchFocused: false
    }
  },
  methods: {
    onInput: debounce(function (event) {
      this.$emit('input', event.target.value)
    }, 100)
  },
  computed: {
    model () { return this.value },
    label () {
      return this.disabled
        ? 'Loading...'
        : 'Search'
    },
    searchContainerClass () {
      return {
        filled: this.value || this.searchFocused,
        disabled: this.disabled
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../assets/style/palette'
@import '../assets/style/flex'

.search-container
  @extend .flex
  margin 1rem 2rem
  position relative
  overflow hidden
  user-select none
  font-smoothing antialised
  font-size 2rem
  @media (max-width 700px)
    font-size 1.5rem
  background-color darken(clear, 20%)
  border-radius 2rem

  &.disabled
    background-color lighten(@background-color, 20%)

  &.filled
    label::before
      transform scale3d(120, 120, 1)

    &::after
      width 100%

  &::after
    content ''
    position absolute
    width 0
    height 2px
    background @background-color
    bottom 0
    left: 0
    transition width 0.3s ease

  label
    position absolute
    padding 0 2.5rem
    left 2rem
    top 0.1rem
    @media (max-width 700px)
      top 0.5rem
    width 100%
    text-align left
    pointer-events none
    color clear

    &::before
      content ''
      position absolute
      left 0
      top 0.3rem
      @media (max-width 700px)
        top 0
      width 2rem
      height @width
      background url(../assets/img/search.svg) no-repeat center center
      background-size 100%
      transition transform 0.3s cubic-bezier(0.7,0,0.3,1)

  input
    width 100%
    height 3rem
    font-weight 100
    border none
    outline none
    padding .5rem
    padding-left 2rem
    background-color transparent
    z-index 2
</style>
