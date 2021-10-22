module.exports = {
    sleep: ms => {
        return new Promise((resolve, reject) => { setTimeout(resolve, ms); })
    }
}