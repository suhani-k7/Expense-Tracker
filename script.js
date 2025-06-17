//today's date in YYYY-MM-DD format
function getDate() {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

//Array to store exp
let expenses = []
let categoryChart = null

// Load exp from localStorage when page loads
window.addEventListener("load", () => {
  loadExpenses()
  displayExpenses()
  updateTotalAmount()
  updateChart()
})

// Handle form submission
document.getElementById("expenseForm").addEventListener("submit", (e) => {
  e.preventDefault()
  addExpense()
})

// func to add new expense
function addExpense() {
  // Get form values
  const amount = Number.parseFloat(document.getElementById("amount").value)
  const category = document.getElementById("category").value
  const description = document.getElementById("description").value
  const date = document.getElementById("date").value

  //expense object
  const expense = {
    id: Date.now(), // Simple ID using timestamp
    amount: amount,
    category: category,
    description: description,
    date: date,
  }

  // Add to expenses array
  expenses.push(expense)

  // Save to localStorage
  saveExpenses()

  // Update display
  displayExpenses()
  updateTotalAmount()
  updateChart()

  // Reset form
  document.getElementById("expenseForm").reset()

  // Show success message (optional)
}

// Function to delete an expense
function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses = expenses.filter((expense) => expense.id !== id)
    saveExpenses()
    displayExpenses()
    updateTotalAmount()
    updateChart()
  }
}

// Function to display all expenses
function displayExpenses() {
  const expensesList = document.getElementById("expensesList")

  if (expenses.length === 0) {
    expensesList.innerHTML = '<p class="no-expenses">No expenses added yet. Add your first expense above!</p>'
    return
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date))

  let html = ""
  sortedExpenses.forEach((expense) => {
    html += `
            <div class="expense-item">
                <div class="expense-info">
                    <h4>${expense.description}</h4>
                    <p>${expense.category} • ${formatDate(expense.date)}</p>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        `
  })

  expensesList.innerHTML = html
}

// Function to format date for display
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Function to update total amount
function updateTotalAmount() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  document.getElementById("totalAmount").textContent = total.toFixed(2)
}

// Function to update the chart
function updateChart() {
  const ctx = document.getElementById("categoryChart").getContext("2d")

  // Calculate expenses by category
  const categoryTotals = {}
  expenses.forEach((expense) => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += expense.amount
    } else {
      categoryTotals[expense.category] = expense.amount
    }
  })

  const categories = Object.keys(categoryTotals)
  const amounts = Object.values(categoryTotals)

  // Colors for different categories
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"]

  // Destroy existing chart if it exists
  if (categoryChart) {
    categoryChart.destroy()
  }

  // Show pie chart of expenses by category
  if (categories.length > 0) {
    categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: colors.slice(0, categories.length),
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
        },
      },
    })
  } else {
    // Show message when no data
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.font = "16px Arial"
    ctx.fillStyle = "#666"
    ctx.textAlign = "center"
    ctx.fillText("No expenses to display", ctx.canvas.width / 2, ctx.canvas.height / 2)
  }
}

// Function to save expenses to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses))
}

// Function to load expenses from localStorage
function loadExpenses() {
  const savedExpenses = localStorage.getItem("expenses")
  if (savedExpenses) {
    expenses = JSON.parse(savedExpenses)
  }
}