<script lang="ts">
  import Pincode from 'svelte-pincode/src/unstyled/Pincode.svelte'
  import PincodeInput from 'svelte-pincode/src/unstyled/PincodeInput.svelte'

  function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight)
  }

  function handleClick() {
    let lotto = lottoCode.join('')

    lottoCode = []
    lottoResult = null
    hentaiResult = null

    isLoadingLotto = true
    isLoadingHentai = true

    fetch('/api/check', {
      method: 'POST',
      body: JSON.stringify({ lotto })
    })
      .then(res => res.json())
      .then(res => {
        lottoResult = res
        isLoadingLotto = false
        scrollToBottom()
      })
    
    fetch('https://api.hifumin.app/v1/graphql', {
      method: 'POST',
      body: JSON.stringify({
        operationName: 'getHentaiById',
        variables: {
          id: Number(lotto)
        },
        query: 'query getHentaiById($id:Int!){nhql{by(id:$id){data{id title{display}images{cover{link info{width height}}}info{amount favorite upload}metadata{language tags{name}artists{name count}characters{name count}parodies{name count}}}}}}'
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          hentaiResult = res
          isLoadingHentai = false
          scrollToBottom()
        }
      })
  }

  let lottoCode: string[] = []
  let lottoResult: any = null
  let hentaiResult: any = null
  let isLoadingLotto = false
  let isLoadingHentai = false
</script>

<svelte:head>
  <title>เห็นไต๋ หวย</title>
</svelte:head>

<div class="min-h-screen flex justify-center">
  <div class="w-full lg:max-w-lg">
    <div class="text-center my-12">
      <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-sm py-2">
        เห็นไต๋ หวย
      </h1>
      <p class="text-lg text-medium text-gray-600">หวยแดกไม่เป็นไร มีโดจินเยียวยาใจ</p>
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
      {#if isLoadingLotto && lottoResult == null}
        <div class="self-center bg-gray-200 w-[278px] md:w-[376px] p-4 rounded-md mb-3">
          <div class="bg-gray-300 py-2 w-[240px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[140px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[180px] animate-pulse"></div>
          <div class="flex mt-3">
            <div class="flex-shrink bg-gray-300 h-[20px] w-[80px] rounded-lg animate-pulse"></div>
          </div>
        </div>
      {/if}
      
      {#if !isLoadingLotto && lottoResult != null}
        <div class="self-center bg-gray-200 w-[278px] md:w-[376px] p-4 rounded-md mb-3">
          <p class="font-bold">ผลการตรวจสลากกินแบ่งรัฐบาล</p>
          <p>เลขสลาก {lottoResult.number}</p>
          <p>งวดประจำวันที่ {lottoResult.date}</p>
          <div class="flex mt-2">
            {#if lottoResult.statusType == 1}
              {#each lottoResult.status_data as status}
                <div class="flex-shrink bg-amber-400 text-black py-1 px-2 text-xs rounded-lg">{status.reward}</div>
              {/each}
            {:else}
              <div class="flex-shrink bg-gray-600 text-white py-1 px-2 text-xs rounded-lg">ไม่ถูกรางวัล</div>
            {/if}
          </div>
        </div>
      {/if}

      {#if isLoadingHentai && hentaiResult == null}
        <div class="self-center bg-gray-200 w-[278px] md:w-[376px] p-4 rounded-md mb-3">
          <div class="bg-gray-300 py-2 w-[240px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[120px] animate-pulse"></div>
          <div class="flex mt-3 mb-6">
            <div class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"></div>
            <div class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"></div>
            <div class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"></div>
          </div>
          <div class="bg-gray-300 h-[320px] w-full rounded-md animate-pulse"></div>
          <div class="bg-gray-300 h-[24px] w-[140px] mt-2 rounded-lg animate-pulse"></div>
        </div>
      {/if}

      {#if !isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data != null}
        <div class="self-center bg-gray-200 w-[278px] md:w-[376px] px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">{hentaiResult.data.nhql.by.data.title.display}</p>
            <p>{hentaiResult.data.nhql.by.data.info.favorite} Favorites</p>
            <div class="flex flex-wrap mt-2">
              {#each hentaiResult.data.nhql.by.data.metadata.tags as tags}
                <div class="flex-shrink bg-slate-300 text-black py-1 px-2 mr-1 mb-1 text-xs rounded-lg">{tags.name}</div>
              {/each}
            </div>
          </div>
          <div class="my-6">
            <img
              referrerpolicy="no-referrer"
              src={hentaiResult.data.nhql.by.data.images.cover.link}
              alt={hentaiResult.data.nhql.by.data.title.display}
              on:load={scrollToBottom}
              class="rounded-md blur-sm hover:blur-none transition-all"
            />
          </div>
          <div class="my-4">
            <a class="text-blue-600" href={`https://hifumin.app/h/${hentaiResult.data.nhql.by.data.id}`} rel="noreferrer" target="_blank">Read on Hifumin</a>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
