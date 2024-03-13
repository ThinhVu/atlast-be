async function execAxios(promise) {
    try {
        const {data} = await promise
        return data
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    execAxios
}