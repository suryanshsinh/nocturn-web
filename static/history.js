class Node {
  constructor (data) {
    this.data = data
    this.next = null
  }
}

class LinkedList {
  constructor () {
    this.head = null
    this.size = 0
  }
  insertSorted (data) {
    const newNode = new Node(data)
    const newTs = parseInt(newNode.data.timeStamp, 10)
    if (!this.head || newTs > parseInt(this.head.data.timeStamp, 10)) {
      newNode.next = this.head
      this.head = newNode
    } else {
      let current = this.head
      while (
        current.next &&
        parseInt(current.next.data.timeStamp, 10) >= newTs
      ) {
        current = current.next
      }
      newNode.next = current.next
      current.next = newNode
    }
    this.size++
  }
  addFirst (data) {
    const newNode = new Node(data)
    newNode.next = this.head
    this.head = newNode
    this.size++
  }
  addLast (data) {
    const newNode = new Node(data)
    if (!this.head) {
      this.head = newNode
    } else {
      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = newNode
    }
    this.size++
  }
  removeFirst () {
    if (!this.head) return null
    const removed = this.head
    this.head = this.head.next
    this.size--
    return removed
  }
  removeLast () {
    if (!this.head) return null
    if (!this.head.next) {
      const removed = this.head
      this.head = null
      this.size--
      return removed
    }
    let current = this.head
    while (current.next.next) {
      current = current.next
    }
    const removed = current.next
    current.next = null
    this.size--
    return removed
  }
}

function getTxUrl (chain, hash, isTestnet) {
  if (chain === 'eth') {
    return isTestnet
      ? `https://sepolia.etherscan.io/tx/${hash}`
      : `https://etherscan.io/tx/${hash}`
  } else if (chain === 'bsc') {
    return isTestnet
      ? `https://testnet.bscscan.com/tx/${hash}`
      : `https://bscscan.com/tx/${hash}`
  } else if (chain === 'pol') {
    return isTestnet
      ? `https://amoy.polygonscan.com/tx/${hash}`
      : `https://polygonscan.com/tx/${hash}`
  }
  return '#'
}

function handleTxClick (tx) {
  const explorerUrl = getTxUrl(tx.chain, tx.hash, testnet === 1)
  window.open(explorerUrl, '_blank')
}

function daysBetween (ts1, ts2) {
  const diff = Math.abs(ts2 - ts1)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function loadAllTransactions () {
  const ll = new LinkedList()
  const chains = ['eth', 'bsc', 'pol']
  const sessionCookie = document.cookie
    .split(';')
    .find(x => x.trim().startsWith('session='))
  const token = sessionCookie ? sessionCookie.split('=')[1] : ''
  chains.forEach(chain => {
    fetch(`/transaction_history?chain=${chain}`, {
      method: 'GET',
      headers: { Authorization: token, Testnet: 1 }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.transactions) {
          data.transactions.forEach(tx => {
            tx.chain = chain
            ll.insertSorted(tx)
          })
        }
        renderTransactionHistory(ll)
      })
      .catch(e => console.log(e))
  })
}

function renderTransactionHistory (linkedList) {
  const container = document.getElementById('crypto-list')
  if (!linkedList.head) {
    container.innerHTML = `<p class="text-gray-600 text-center py-4">No transactions found</p>`
    return
  }
  container.innerHTML = ''
  let current = linkedList.head
  while (current) {
    const tx = current.data
    const color = tx.color
    let colorClass, direction
    if (color === 'red') {
      colorClass = 'bg-red-100 text-red-600'
      direction = 'Error'
    } else if (color === 'blue') {
      colorClass = 'bg-blue-100 text-blue-600'
      direction = 'Sent'
    } else {
      colorClass = 'bg-green-100 text-green-600'
      direction = 'Received'
    }
    const timeSec = parseInt(tx.timeStamp, 10) * 1000
    const daysAgo = daysBetween(timeSec, Date.now())
    const displayVal = parseFloat(tx.value).toFixed(6)
    const card = document.createElement('div')
    card.className =
      'flex hover:bg-gray-200 cursor-pointer items-center justify-between p-4 bg-[#F2F2F4] rounded-2xl'
    card.onclick = () =>
      window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')
    card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 ${
            colorClass.split(' ')[0]
          } rounded-full flex items-center justify-center">
            <i class="fas fa-exchange-alt text-xl ${
              colorClass.split(' ')[1]
            }"></i>
          </div>
          <div>
            <h2 class="font-semibold">${direction} ${displayVal} ${tx.chain.toUpperCase()}</h2>
            <p class="text-sm text-[#9CA3AF]">${daysAgo} day${
      daysAgo !== 1 ? 's' : ''
    } ago</p>
          </div>
        </div>
      `
    container.appendChild(card)
    card.onclick = () => handleTxClick(tx)
    current = current.next
  }
}

document.addEventListener('DOMContentLoaded', loadAllTransactions)
