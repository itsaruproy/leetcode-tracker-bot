const accounts = require("../accounts.json")
const fs = require("fs/promises")
const axios = require("axios")
async function getStats(username, realName) {
    try {
        const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}/`)
        // console.log(res)
        if(res.data.status == 'error') {
            return "User does not exist"
        }
        const message = `
        Stats of ${realName}(${username})
    
        Easy - ${res.data.easySolved} / ${res.data.totalEasy}
        Medium - ${res.data.mediumSolved} / ${res.data.totalMedium}
        Hard - ${res.data.hardSolved} / ${res.data.totalHard}
    
        Total - ${res.data.totalSolved} / ${res.data.totalQuestions}
        
        `
    
        return message
    } catch(e) {
        // console.log(e)
        return "Some problem occurred"
    }
    
}

async function getTotalSolved(username) {
    try {
        const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}/`)
        return res.data.totalSolved
    } catch(e) {
        // console.log(e)
        return "Some problem occurred"
    }
    
}

async function initDB(accountsObject, isInitial) {
    let newDBObject = {}
    /* try {
        let data = await JSON.parse(fs.readFile("../accounts.json"))
    } catch(e) {
        console.log("Error fetching accounts.json")
    }
    */
    
    
    /* 
        build the db.json file from accounts.json
    */
    if(isInitial === true) {
        for (let username in accountsObject ) {        
            newDBObject[username] = 0         
        }
    } else {
        newDBObject = accountsObject
    }
    
    try {
        await fs.writeFile("./db.json", JSON.stringify(newDBObject))
        console.log("db.json successfully initialized")
        return "ok"
    } catch(e) {
        console.log("Error writing to db.json")
    }
}

module.exports = {
    getStats,
    getTotalSolved,
    initDB
}


