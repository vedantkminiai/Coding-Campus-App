// src/data/quiz.js
// Topics and question bank for the DSA quiz game

export const TOPICS = [
  { id: "arrays",      name: "Arrays",             icon: "🗃️", color: "var(--accent)" },
  { id: "linkedlists", name: "Linked Lists",        icon: "🔗", color: "var(--accent2)" },
  { id: "trees",       name: "Trees & Graphs",      icon: "🌳", color: "#4ade80" },
  { id: "sorting",     name: "Sorting Algorithms",  icon: "📊", color: "var(--accent3)" },
  { id: "complexity",  name: "Big-O Complexity",    icon: "⏱️", color: "#f472b6" },
];

// Each question: { q, options[], answer (index), difficulty, category, explanation }
export const QUESTIONS = {
  arrays: [
    {
      q: "What is the time complexity of accessing an element in an array by index?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: 2,
      difficulty: "easy",
      category: "Arrays",
      explanation:
        "Arrays store elements in contiguous memory. Given a base address and index, the CPU computes the exact memory address in a single step — O(1).",
    },
    {
      q: "Which operation on a dynamic array is O(n) in the worst case?",
      options: ["Access by index", "Insert at end (amortized)", "Insert at beginning", "Get length"],
      answer: 2,
      difficulty: "medium",
      category: "Arrays",
      explanation:
        "Inserting at the beginning requires shifting all n existing elements one position to the right, making it O(n).",
    },
    {
      q: "A 2D array of size m×n is stored in row-major order. What is the flat index of element [i][j]?",
      options: ["i * m + j", "i * n + j", "j * m + i", "j * n + i"],
      answer: 1,
      difficulty: "hard",
      category: "Arrays",
      explanation:
        "Row i starts at position i*n (each row has n elements). Adding j gives the final index: i*n + j.",
    },
    {
      q: "What is the space complexity of an array of n integers?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      difficulty: "easy",
      category: "Arrays",
      explanation:
        "Storing n integers requires memory proportional to n, so space complexity is O(n).",
    },
  ],

  linkedlists: [
    {
      q: "What advantage does a doubly linked list have over a singly linked list?",
      options: [
        "Uses less memory",
        "Allows traversal in both directions",
        "Faster search by value",
        "Supports random access",
      ],
      answer: 1,
      difficulty: "easy",
      category: "Linked Lists",
      explanation:
        "Each node stores pointers to both next and previous nodes, enabling backward traversal — impossible in a singly linked list.",
    },
    {
      q: "What is the time complexity of deleting a node given only a pointer to that node (not its predecessor)?",
      options: ["O(1)", "O(log n)", "O(n)", "Not possible"],
      answer: 0,
      difficulty: "hard",
      category: "Linked Lists",
      explanation:
        "Copy the next node's value into the current node, then delete the next node. This achieves O(1) without needing the predecessor.",
    },
    {
      q: "Which data structure is most efficiently implemented using a linked list?",
      options: [
        "Binary search",
        "Queue with O(1) enqueue & dequeue",
        "Random access table",
        "Heap",
      ],
      answer: 1,
      difficulty: "medium",
      category: "Linked Lists",
      explanation:
        "A linked list supports O(1) insertion at head and removal at tail (with a tail pointer), making it ideal for queue implementation.",
    },
    {
      q: "Floyd's cycle detection algorithm uses how many pointers?",
      options: ["1", "2", "3", "4"],
      answer: 1,
      difficulty: "medium",
      category: "Linked Lists",
      explanation:
        "Floyd's algorithm uses a 'slow' pointer (1 step) and a 'fast' pointer (2 steps). If they meet, a cycle exists.",
    },
  ],

  trees: [
    {
      q: "In a balanced BST with n nodes, what is the average search time?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
      difficulty: "easy",
      category: "Trees",
      explanation:
        "A balanced BST has height log(n). Each comparison halves the search space, leading to O(log n) time.",
    },
    {
      q: "Which traversal visits BST nodes in ascending sorted order?",
      options: ["Pre-order", "Post-order", "In-order", "Level-order"],
      answer: 2,
      difficulty: "easy",
      category: "Trees",
      explanation:
        "In-order traversal (left → root → right) visits nodes in ascending order because of the BST property: left < root < right.",
    },
    {
      q: "In Dijkstra's algorithm, what data structure is used for efficiency?",
      options: ["Stack", "Queue", "Priority Queue (Min-Heap)", "Linked List"],
      answer: 2,
      difficulty: "hard",
      category: "Graphs",
      explanation:
        "A min-heap extracts the minimum-distance node in O(log n), making Dijkstra's overall complexity O((V+E) log V).",
    },
    {
      q: "What is the maximum number of nodes in a binary tree of height h?",
      options: ["h", "2h", "2^h - 1", "2^(h+1) - 1"],
      answer: 3,
      difficulty: "medium",
      category: "Trees",
      explanation:
        "Levels 0 through h contain 2^0 + 2^1 + ... + 2^h = 2^(h+1) - 1 nodes total.",
    },
  ],

  sorting: [
    {
      q: "Which algorithm guarantees O(n log n) in best, average, AND worst case?",
      options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Bubble Sort"],
      answer: 1,
      difficulty: "easy",
      category: "Sorting",
      explanation:
        "Merge Sort always splits in half and merges in O(n), guaranteeing O(n log n) every time — unlike Quick Sort which degrades to O(n²) worst case.",
    },
    {
      q: "What is the best-case time complexity of Insertion Sort?",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      answer: 2,
      difficulty: "medium",
      category: "Sorting",
      explanation:
        "When the array is already sorted, Insertion Sort makes one pass with no swaps — O(n) best case.",
    },
    {
      q: "What triggers Quick Sort's O(n²) worst-case behavior?",
      options: [
        "Random array",
        "Array with all equal elements",
        "Sorted array with first element as pivot",
        "Array of size 1",
      ],
      answer: 2,
      difficulty: "hard",
      category: "Sorting",
      explanation:
        "If the first element is always the pivot on a sorted array, every partition produces subarrays of size 0 and n-1, causing O(n²) depth.",
    },
    {
      q: "Which algorithm is both stable and uses O(1) extra space?",
      options: ["Merge Sort", "Heap Sort", "Insertion Sort", "Quick Sort"],
      answer: 2,
      difficulty: "medium",
      category: "Sorting",
      explanation:
        "Insertion Sort is stable (preserves equal element order) and in-place (O(1) space), though average time is O(n²).",
    },
  ],

  complexity: [
    {
      q: "What is the Big-O of: for(i=0;i<n;i++) for(j=i;j<n;j++) {}",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
      answer: 2,
      difficulty: "medium",
      category: "Big-O",
      explanation:
        "The inner loop runs n-i times per i. Total = n + (n-1) + ... + 1 = n(n+1)/2 = O(n²).",
    },
    {
      q: "Which complexity is the MOST efficient?",
      options: ["O(n!)", "O(2^n)", "O(n²)", "O(n log n)"],
      answer: 3,
      difficulty: "easy",
      category: "Big-O",
      explanation:
        "From most to least efficient: O(n log n) < O(n²) < O(2^n) < O(n!). O(n log n) grows slowest here.",
    },
    {
      q: "Naive recursive Fibonacci fib(n) = fib(n-1) + fib(n-2) has what time complexity?",
      options: ["O(n)", "O(n²)", "O(2^n)", "O(log n)"],
      answer: 2,
      difficulty: "hard",
      category: "Big-O",
      explanation:
        "Each call branches into two, forming a binary tree of height n. Total calls approach 2^n, giving O(2^n).",
    },
    {
      q: "Binary search on 1024 elements requires at most how many comparisons?",
      options: ["10", "16", "32", "1024"],
      answer: 0,
      difficulty: "medium",
      category: "Big-O",
      explanation:
        "log₂(1024) = 10. Binary search halves the search space each step — at most 10 comparisons needed.",
    },
  ],
};
