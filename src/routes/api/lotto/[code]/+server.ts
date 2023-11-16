import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const lotto = params.code
  if (!lotto || lotto.length != 6) {
    throw error(400, 'lotto must be 6 digit')
  }

  const { date } = await fetch('https://www.glo.or.th/api/lottery/getLatestLottery', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://www.glo.or.th',
      referer: 'https://www.glo.or.th/home-page',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    },
    redirect: 'follow'
  })
    .then((res) => res.json())
    .then((res) => res.response)

  const res = await fetch('https://www.glo.or.th/api/checking/getcheckLotteryResult', {
    method: 'POST',
    body: JSON.stringify({
      number: [
        {
          lottery_num: lotto
        }
      ],
      period_date: date
    }),
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      origin: 'https://www.glo.or.th',
      referer: 'https://www.glo.or.th/mission/reward-payment/check-reward',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    },
    redirect: 'follow'
  })
    .then((res) => res.json())
    .then((res) => res.response.result[0])

  return new Response(JSON.stringify(res), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=1, stale-while-revalidate=59'
    }
  })
}
