<template>
  <transition name="modal">
    <div
      v-if="$data.__show"
      :class="`modal-container${$props.cancelable ? '' : ' no-close'}`"
      @click.self="
        () => {
          if (!$props.cancelable) return;
          $emit('closed');
          hide();
        }
      "
    >
      <div class="modal">
        <div class="modal-header">
          <h1 class="modal-title" v-text="$props.title" /><img
            v-if="$props.cancelable"
            class="modal-close"
            src="/assets/images/close.svg"
            alt="Close Modal"
            @click.self="
              () => {
                if (!$props.cancelable) return;
                $emit('closed');
                hide();
              }
            "
        /></div>
        <div class="modal-content">
          <slot name="default">
            <p>Default Modal Content</p>
          </slot>
        </div>
        <div class="modal-buttons">
          <slot name="buttons">
            <button
              @click="
                () => {
                  if (!$props.cancelable) return;
                  $emit('closed');
                  hide();
                }
              "
              v-if="$props.cancelable"
              >Close</button
            >
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';

  @Options({
    components: {},
    props: {
      title: {
        type: String,
        default: 'Modal Title'
      },
      cancelable: Boolean,
      visible: Boolean
    },
    data() {
      return {
        __show: false
      };
    },
    emits: ['closed'] //Only emitted when the modal is closed through a default action, ex: clicking off modal, clicking close button, clicking default close modal button
  })
  export default class Modal extends Vue {
    declare $data: {
      __show: boolean;
    };
    declare $props: {
      title: string;
      cancelable: boolean;
      visible: boolean;
    };
    beforeUnmount() {
      this.hide();
    }
    hide() {
      if (document.body.classList.contains('no-scroll'))
        document.body.classList.remove('no-scroll');
      this.$data.__show = false;
    }
    show() {
      if (!document.body.classList.contains('no-scroll'))
        document.body.classList.add('no-scroll');
      this.$data.__show = true;
    }
    mounted() {
      if (this.$props.visible)
        setTimeout(() => (this.$data.__show = true), 500);
    }
  }
</script>

<style>
  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    z-index: 15;
    background-color: #000000aa;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
  }

  .modal {
    background-color: #fff;
    width: fit-content;
    padding: 25px;
    margin: 25px;
    cursor: default;
    border-radius: 20px;
  }

  html.dark-theme .modal {
    background-color: #212121;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
  }

  .modal-title {
    margin: auto;
  }

  .modal-close {
    display: inline;
    margin-left: 15px;
    cursor: pointer;
  }

  html.dark-theme .modal-close {
    filter: invert(1);
  }

  .modal-content p {
    margin: 0;
  }

  .modal-content {
    margin: 15px 0 10px;
    padding: 0 5px 10px;
    overflow-y: auto;
    max-height: 50vh;
    line-height: 1.5;
  }

  .modal-buttons button {
    margin: 2.5px 5px;
  }

  .modal-container.no-close {
    cursor: not-allowed;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.4s, backdrop-filter 0.4s;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    backdrop-filter: none;
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    backdrop-filter: blur(3px);
  }
</style>
