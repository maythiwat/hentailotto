<script lang="ts">
  import Pincode from 'svelte-pincode/src/unstyled/Pincode.svelte'
  import PincodeInput from 'svelte-pincode/src/unstyled/PincodeInput.svelte'

  function handleClick() {
    lottoCode = []
  }

  let lottoCode = [] as string[]
</script>

<div class="min-h-screen flex justify-center">
  <div class="w-full lg:max-w-lg">
    <div class="text-center my-12">
      <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-sm mb-2">
        เห็นไต๋ หวย
      </h1>
      <p class="text-medium text-gray-600">หวยแดกไม่เป็นไร มีโดจินเยียวยาใจ</p>
    </div>

    <Pincode class="flex justify-center my-6" bind:code={lottoCode} type="numeric">
      {#each Array(6) as _}
        <PincodeInput class="flex mx-1 h-10 w-10 md:h-14 md:w-14 text-lg md:text-2xl text-center align-middle border-2 border-gray-300 rounded-md" />
      {/each}
    </Pincode>

    <div class="flex justify-center">
      <button
        class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-300 text-white disabled:text-gray-600 transition-colors py-2 rounded-md w-[278px] md:w-[376px]"
        disabled={lottoCode.join('').length != 6}
        on:click|preventDefault={handleClick}
      >
        ตรวจหวย
      </button>
    </div>

    <div class="flex flex-col my-12">
      <div class="self-center bg-gray-200 w-[278px] md:w-[376px] p-4 rounded-md mb-3">
        ผลการตรวจสลากกินแบ่งรัฐบาล
      </div>

      <div class="self-center bg-gray-200 w-[278px] md:w-[376px] p-4 rounded-md">
        อะไรไม่รู้
      </div>
    </div>


    <div class="my-5 text-center">
      {lottoCode}
    </div>
  </div>
</div>
