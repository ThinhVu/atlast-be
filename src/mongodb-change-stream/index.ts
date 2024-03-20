import {watchCollection} from './watch-change'

export default async function useChangeStream(app: any) {
    console.log('[app] useChangeStream')
    await watchCollection()
}