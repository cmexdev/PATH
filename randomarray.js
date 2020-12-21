const array = ['One', 'Two', 'Three']
const final = []
const wip = []

var rn = Math.floor(Math.random() * array.length)

for (let i = 0; i < array.length; i++) {
    const el = array[i]
    if (i == rn) {
        final.push(el)
    }
    else {
        wip.push(el)
    }
}

for (let i = 0; i < wip.length; i++) {
    const el = wip[i]
    var rn2 = Math.floor(Math.random() * wip.length)
    if (rn2 == i) {
        final.push(el)
    }
    else {
        final.push(el)
    }
}