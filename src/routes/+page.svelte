<script lang="ts">
  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function scrollToResults() {
    document.querySelector('#results')?.scrollIntoView()
  }

  function onInputPaste(e: ClipboardEvent) {
    let paste = e.clipboardData?.getData('text')
    if (!paste) return false

    if (lottoCode.length == 0 && /^[0-9]{6}$/gm.test(paste)) {
      lottoCode = paste
      handler()
      return false
    }

    let codeOnly = paste.replace(/[^0-9]+/g, '')
    if (codeOnly.length == 0) return false

    lottoCode = lottoCode + codeOnly.slice(0, 6 - lottoCode.length)
    window.scrollTo(0, 0)
    return true
  }

  function loadLotto(lotto: string) {
    lottoResult = null
    isLoadingLotto = true
    isRandomHentai = false
    enableRandomButton = false

    fetch(`/api/lotto/${lotto}`, {
      method: 'GET'
    })
      .then((res) => res.json())
      .then((res) => {
        lottoResult = res
        isLoadingLotto = false
        scrollToResults()
      })
  }

  function loadHentai(id: string | number) {
    hentaiResult = null
    isLoadingHentai = true

    fetch('https://api.hifumin.app/v1/graphql', {
      method: 'POST',
      body: JSON.stringify({
        operationName: 'getHentaiById',
        variables: {
          id: Number(id)
        },
        query:
          'query getHentaiById($id:Int!){nhql{by(id:$id){data{id title{display}images{cover{link info{width height}}}info{amount favorite upload}metadata{language tags{name}artists{name count}characters{name count}parodies{name count}}}}}}'
      })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          hentaiResult = res
          isLoadingHentai = false

          if (!res.data.nhql.by.data && isRandomHentai && !isFulfilled) {
            if (attempt >= 10) {
              loadHentai(177013)
            }else{
              randomHentai()
              attempt++
            }
            return
          }

          isFulfilled = true
          attempt = 0
          scrollToResults()
        }
      })
  }

  function randomHentai() {
    isLoadingLotto = false
    lottoResult = null
    enableRandomButton = true
    isRandomHentai = true
    isFulfilled = false
    loadHentai(getRandomInt(100000, 500000))
  }

  function handler() {
    if (!/^\d{6}$/gm.test(lottoCode)) return

    let lotto = lottoCode
    lottoCode = ''

    loadLotto(lotto)
    loadHentai(lotto)
  }

  let lottoCode: string = ''
  let lottoResult: any = null
  let hentaiResult: any = null
  let isLoadingLotto = false
  let isLoadingHentai = false
  let isRandomHentai = false
  let isFulfilled = true
  let attempt = 0
  let enableRandomButton = false
</script>

<svelte:head>
  <title>เห็นไต๋ หวย</title>
  <meta
    name="description"
    content="ตรวจหวยยังไงให้แหวกกว่าใครเขา... เห็นไต๋ หวย (Hentai Lotto) จะพาคุณดำดิ่งสู่จักรวาลแห่งเลข 6 หลัก"
  />
  <meta property="og:title" content="เห็นไต๋ หวย | Hentai Lotto" />
  <meta
    property="og:description"
    content="ดำดิ่งสู่จักรวาลแห่งเลข 6 หลัก เว็บตรวจหวยที่พาคุณขึ้นสวรรค์ได้ หนึ่งในผลงานคุณภาพจาก Wazt"
  />
  <meta property="og:image" content="/wazt-ogp.jpg" />
</svelte:head>

<div class="min-h-screen flex justify-center">
  <div class="w-full md:max-w-md">
    <div class="text-center my-12">
      <h1
        class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-sm py-2"
      >
        เห็นไต๋ หวย
      </h1>
      <p class="text-lg text-medium text-gray-600">หวยแดกไม่เป็นไร มีโดจินเยียวยาใจ</p>
    </div>

    <form on:submit|preventDefault={handler} class="mx-4">
      <!-- svelte-ignore a11y-autofocus -->
      <input
        type="text"
        inputmode="numeric"
        minlength="6"
        maxlength="6"
        pattern={'[0-9]{6}'}
        required
        placeholder="เลขหวย 6 หลัก"
        autofocus
        class="w-full p-2 text-2xl text-center border-2 border-gray-300 rounded-md"
        bind:value={lottoCode}
        on:paste|preventDefault={onInputPaste}
      />

      <button
        type="submit"
        class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-300 text-white disabled:text-gray-600 transition-colors mt-3 py-2 rounded-md w-full"
        disabled={lottoCode.length < 6}
      >
        ตรวจหวย
      </button>
      {#if enableRandomButton}
        <button
          type="button"
          class="text-white bg-gradient-to-r from-sky-400 to-purple-500 hover:drop-shadow-lg transition-all mt-3 py-2 rounded-md w-full"
          on:click={randomHentai}
        >
          สุ่มโดจิน
        </button>
      {/if}
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
                <div class="flex-shrink bg-amber-400 text-black py-1 px-2 text-xs rounded-lg">
                  {status.reward}
                </div>
              {/each}
            {:else}
              <div class="flex-shrink bg-gray-600 text-white py-1 px-2 text-xs rounded-lg">
                ไม่ถูกรางวัล
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if isLoadingHentai && hentaiResult == null}
        <div class="self-center bg-gray-200 w-full p-4 rounded-md mb-3">
          <div class="bg-gray-300 py-2 w-[240px] animate-pulse"></div>
          <div class="bg-gray-300 py-2 mt-2 w-[120px] animate-pulse"></div>
          <div class="flex mt-3 mb-6">
            <div
              class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"
            ></div>
            <div
              class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"
            ></div>
            <div
              class="flex-shrink bg-gray-300 h-[20px] w-[80px] mr-1 rounded-lg animate-pulse"
            ></div>
          </div>
          <div class="bg-gray-300 h-[320px] w-full rounded-md animate-pulse"></div>
          <div class="bg-gray-300 h-[24px] w-[140px] mt-2 rounded-lg animate-pulse"></div>
        </div>
      {/if}

      {#if !isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data != null}
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            {#if isRandomHentai}
              <div class="flex flex-wrap mb-2">
                <div
                  class="flex-shrink bg-gradient-to-r from-sky-400 to-purple-500 text-white py-1 px-2 text-xs rounded-lg"
                >
                  <span class="font-medium">Random</span> |
                  <span class="font-medium">{hentaiResult.data.nhql.by.data.id}</span>
                </div>
              </div>
            {/if}
            <p class="font-bold">{hentaiResult.data.nhql.by.data.title.display}</p>
            <p>{hentaiResult.data.nhql.by.data.info.favorite} Favorites</p>
            <div class="flex flex-wrap mt-2">
              {#each hentaiResult.data.nhql.by.data.metadata.tags as tags}
                <div
                  class="flex-shrink bg-slate-300 text-black py-1 px-2 mr-1 mb-1 text-xs rounded-lg"
                >
                  {tags.name}
                </div>
              {/each}
            </div>
          </div>
          <div class="my-8">
            <img
              referrerpolicy="no-referrer"
              src={hentaiResult.data.nhql.by.data.images.cover.link}
              alt={hentaiResult.data.nhql.by.data.title.display}
              on:load={scrollToResults}
              class="w-full rounded-md blur-sm hover:blur-none transition-all"
            />
          </div>
          <div class="my-4">
            <div class="mb-2 text-gray-900 text-center">อยากอ่านที่เว็บไหน?</div>
            <div class="mb-2">
              <a
                class="flex justify-center bg-gradient-to-r from-sky-600 to-gray-400 hover:drop-shadow-lg transition-all text-white rounded-md py-2"
                href={`https://hifumin.app/h/${hentaiResult.data.nhql.by.data.id}`}
                rel="noreferrer"
                target="_blank"
              >
                <span class="font-semibold">Hifumin</span>
              </a>
            </div>
            <div class="mb-2">
              <a
                class="flex justify-center bg-white hover:drop-shadow-lg transition-all text-blue-600 rounded-md py-2"
                href={`https://h.rayriffy.com/g/${hentaiResult.data.nhql.by.data.id}`}
                rel="noreferrer"
                target="_blank"
              >
                <span class="font-semibold">Riffy H</span>
              </a>
            </div>
            <div>
              <a
                class="flex justify-center bg-gray-800 hover:drop-shadow-lg transition-all text-white rounded-md py-2"
                href={`https://nhentai.net/g/${hentaiResult.data.nhql.by.data.id}`}
                rel="noreferrer"
                target="_blank"
              >
                <span class="font-semibold"><span class="text-red-500">n</span>hentai</span>
              </a>
            </div>
          </div>
        </div>
      {/if}

      {#if !isLoadingLotto && lottoResult != null && lottoResult.statusType == 1 && !isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data == null}
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">😜 บุญมีแต่กรรมบัง</p>
            <p>ยินดีด้วย! คุณถูกรางวัล! แต่น่าเสียดาย... ที่นี่ไม่มีโดจินสำหรับคุณ</p>
            <button
              class="text-white bg-gradient-to-r from-sky-400 to-purple-500 hover:drop-shadow-lg transition-all mt-3 py-2 rounded-md w-full"
              on:click={randomHentai}
            >
              สุ่มโดจิน แก้เซ็งไปพลางๆ ?
            </button>
          </div>
        </div>
      {/if}

      {#if !isLoadingLotto && lottoResult != null && lottoResult.statusType == 2 && !isLoadingHentai && hentaiResult != null && hentaiResult.data.nhql.by.data == null}
        <div class="self-center bg-gray-200 w-full px-4 rounded-md">
          <div class="my-4">
            <p class="font-bold">😭 ช่างน่าเศร้าเสียจริงๆ</p>
            <p>โดนหวยแดกแล้ว มิหนำซ้ำยังไม่มีโดให้อ่านอีก กร๊ากๆๆ</p>
            <button
              class="text-white bg-gradient-to-r from-sky-400 to-purple-500 hover:drop-shadow-lg transition-all mt-3 py-2 rounded-md w-full"
              on:click={randomHentai}
            >
              สุ่มโดจิน แก้เซ็งไปพลางๆ ?
            </button>
          </div>
        </div>
      {/if}
    </div>

    <div class="mt-3 mb-6">
      <a href="https://wazt.net">
        <img alt="wazt" src="/wazt.svg" class="h-6 mx-auto mb-3" />
      </a>
      <p class="text-center text-gray-600 text-sm">~ just another side project by wazt ~</p>
    </div>
  </div>
</div>
