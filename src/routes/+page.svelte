<script lang="ts">
  function scrollToResults() {
    document.querySelector('#results')?.scrollIntoView()
  }

  function handler() {
    if (!/^\d{6}$/gm.test(lottoCode)) return

    let lotto = lottoCode

    lottoCode = ''
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
        scrollToResults()
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
          scrollToResults()
        }
      })
  }

  let lottoCode: string = ''
  let lottoResult: any = null
  let hentaiResult: any = null
  let isLoadingLotto = false
  let isLoadingHentai = false
</script>

<svelte:head>
  <title>เห็นไต๋ หวย</title>
</svelte:head>

<div class="min-h-screen flex justify-center">
  <div class="w-full md:max-w-md">
    <div class="text-center my-12">
      <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-sm py-2">
        เห็นไต๋ หวย
      </h1>
      <p class="text-lg text-medium text-gray-600">หวยแดกไม่เป็นไร มีโดจินเยียวยาใจ</p>
    </div>

    <form on:submit|preventDefault={handler} class="flex mx-4">
      <input
        type="text" inputmode="numeric" minlength="6" maxlength="6" pattern={'[0-9]{6}'} required
        placeholder="เลขหวย 6 หลัก"
        class="w-full p-2 text-2xl text-center border-2 border-gray-300 rounded-md"
        bind:value={lottoCode}
      />
    </form>

    <div class="flex flex-col py-6 mx-4" id="results">
      {#if isLoadingLotto && lottoResult == null}
        <div class="self-center bg-gray-200 w-full p-4 rounded-md mb-3">
          <div class="bg-gray-300 py-2 w-[240px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[140px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[180px] animate-pulse"></div>
          <div class="flex mt-3">
            <div class="flex-shrink bg-gray-300 h-[20px] w-[80px] rounded-lg animate-pulse"></div>
          </div>
        </div>
      {/if}
      
      {#if !isLoadingLotto && lottoResult != null && typeof lottoResult.statusType != 'undefined'}
        <div class="self-center bg-gray-200 w-full p-4 rounded-md mb-3">
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
        <div class="self-center bg-gray-200 w-full p-4 rounded-md mb-3">
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
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">{hentaiResult.data.nhql.by.data.title.display}</p>
            <p>{hentaiResult.data.nhql.by.data.info.favorite} Favorites</p>
            <div class="flex flex-wrap mt-2">
              {#each hentaiResult.data.nhql.by.data.metadata.tags as tags}
                <div class="flex-shrink bg-slate-300 text-black py-1 px-2 mr-1 mb-1 text-xs rounded-lg">{tags.name}</div>
              {/each}
            </div>
          </div>
          <div class="my-8">
            <img
              referrerpolicy="no-referrer"
              src={hentaiResult.data.nhql.by.data.images.cover.link}
              alt={hentaiResult.data.nhql.by.data.title.display}
              on:load={scrollToResults}
              class="rounded-md blur-sm hover:blur-none transition-all"
            />
          </div>
          <div class="my-4">
            <div class="mb-2">
              <a class="text-blue-600" href={`https://hifumin.app/h/${hentaiResult.data.nhql.by.data.id}`} rel="noreferrer" target="_blank">Read on Hifumin</a>
            </div>
            <div>
              <a class="text-blue-600" href={`https://nhentai.net/g/${hentaiResult.data.nhql.by.data.id}`} rel="noreferrer" target="_blank">Read on nHentai</a>
            </div>
          </div>
        </div>
      {/if}

      {#if (!isLoadingLotto && lottoResult != null && lottoResult.statusType == 1) && (!isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data == null)}
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">😜 บุญมีแต่กรรมบัง</p>
            <p>ยินดีด้วย! คุณถูกรางวัล! แต่น่าเสียดาย... ที่นี่ไม่มีโดจินสำหรับคุณ</p>
          </div>
        </div>
      {/if}

      {#if (!isLoadingLotto && lottoResult != null && lottoResult.statusType == 2) && (!isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data == null)}
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">😭 ช่างน่าเศร้าเสียจริงๆ</p>
            <p>โดนหวยแดกแล้ว มิหนำซ้ำยังอดอ่านโดจินอีก กร๊ากๆๆ</p>
          </div>
        </div>
      {/if}
    </div>

    <div class="mt-3 mb-6">
      <a href="https://wazt.net">
        <img alt="wazt" src="/wazt.svg" class="h-6 mx-auto mb-3">
      </a>
      <p class="text-center text-gray-600 text-sm">~ just another side project by wazt ~</p>
    </div>
  </div>
</div>
