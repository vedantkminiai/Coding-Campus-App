// src/data/quiz.js
// Topics and question bank for the DSA quiz game

export const TOPICS = [
  { id: "arrays",      name: "Arrays",             icon: "🗃️", color: "var(--accent)" },
  { id: "linkedlists", name: "Linked Lists",        icon: "🔗", color: "var(--accent2)" },
  { id: "trees",       name: "Trees & Graphs",      icon: "🌳", color: "#4ade80" },
  { id: "sorting",     name: "Sorting Algorithms",  icon: "📊", color: "var(--accent3)" },
  { id: "complexity",  name: "Big-O Complexity",    icon: "⏱️", color: "#f472b6" },
];

export const LEETCODE_TOPICS = [
  ...TOPICS.map((topic, index) => ({ ...topic, level: index + 1 })),
  { id: "leetcode-stacks", name: "Stacks", icon: "📚", level: 6 },
  { id: "leetcode-binary-search", name: "Binary Search", icon: "🎯", level: 7 },
  { id: "leetcode-trees", name: "Trees", icon: "🌳", level: 8 },
  { id: "leetcode-tries", name: "Tries", icon: "🔤", level: 9 },
  { id: "leetcode-heaps", name: "Heaps", icon: "⛰️", level: 10 },
  { id: "leetcode-backtracking", name: "Backtracking", icon: "🧭", level: 11 },
];

// Each question: { q, options[], answer (index), difficulty, category, explanation }
export const QUESTIONS = {
  "leetcode-stacks": [
    {
      q: "Which rule describes the order in which a stack removes elements?",
      options: ["FIFO", "LIFO", "Lowest value first", "Random order"],
      answer: 1,
      difficulty: "easy",
      category: "Stacks",
      explanation: "A stack is Last In, First Out: the most recently pushed item is the first one popped.",
    },
    {
      q: "Which stack technique solves the Valid Parentheses problem?",
      options: ["Push opening brackets and match them when closing brackets appear", "Sort every bracket", "Use binary search", "Count only the opening brackets"],
      answer: 0,
      difficulty: "easy",
      category: "Stacks",
      explanation: "Opening brackets are pushed; every closing bracket must match the type at the top of the stack.",
    },
    {
      q: "A monotonic decreasing stack is especially useful for finding what?",
      options: ["Connected components", "The next greater element", "A string prefix", "The middle linked-list node"],
      answer: 1,
      difficulty: "medium",
      category: "Stacks",
      explanation: "A decreasing stack keeps unresolved values until a larger value appears, which reveals their next greater element.",
    },
    {
      q: "What is the time complexity of the standard stack solution to Daily Temperatures?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      difficulty: "hard",
      category: "Stacks",
      explanation: "Each index is pushed and popped at most once, so all stack operations total O(n).",
    },
  ],

  "leetcode-binary-search": [
    {
      q: "What condition must usually be true before using binary search on an array?",
      options: ["It must be sorted", "It must contain unique values", "It must have even length", "It must be a linked list"],
      answer: 0,
      difficulty: "easy",
      category: "Binary Search",
      explanation: "Binary search relies on sorted order to discard half of the remaining search space after each comparison.",
    },
    {
      q: "Which midpoint expression avoids integer overflow?",
      options: ["(left + right) * 2", "left + (right - left) / 2", "right - left / 2", "left / right"],
      answer: 1,
      difficulty: "easy",
      category: "Binary Search",
      explanation: "left + (right - left) / 2 avoids adding two potentially large boundary values directly.",
    },
    {
      q: "When searching for the first true value in a false-then-true predicate, what should happen when predicate(mid) is true?",
      options: ["Move left to mid + 1", "Move right to mid", "Stop without saving mid", "Reset both boundaries"],
      answer: 1,
      difficulty: "medium",
      category: "Binary Search",
      explanation: "A true midpoint may be the first true value, so it remains in the range while the right boundary moves to mid.",
    },
    {
      q: "Binary search on the answer is valid when the feasibility test has which property?",
      options: ["Randomness", "Monotonicity", "Recursion only", "Constant memory only"],
      answer: 1,
      difficulty: "hard",
      category: "Binary Search",
      explanation: "The possible answers must transition monotonically from infeasible to feasible, or the reverse, so half can be discarded.",
    },
  ],

  "leetcode-trees": [
    {
      q: "Which traversal naturally uses a queue?",
      options: ["Preorder DFS", "Inorder DFS", "Postorder DFS", "Level-order BFS"],
      answer: 3,
      difficulty: "easy",
      category: "Trees",
      explanation: "Level-order traversal processes nodes breadth-first, using a queue to visit each level from left to right.",
    },
    {
      q: "What is the base case when recursively finding the maximum depth of a binary tree?",
      options: ["A null node has depth 0", "Every leaf has depth 0 only", "The root has depth n", "A missing child has depth 1"],
      answer: 0,
      difficulty: "easy",
      category: "Trees",
      explanation: "A null subtree contributes zero depth; a real node adds one to the maximum depth of its children.",
    },
    {
      q: "How can a recursive function validate a binary search tree correctly?",
      options: ["Compare each node only with its children", "Pass valid lower and upper bounds down the tree", "Check that every level is sorted", "Count the leaves"],
      answer: 1,
      difficulty: "medium",
      category: "Trees",
      explanation: "Each node must satisfy constraints inherited from every ancestor, which lower and upper bounds capture.",
    },
    {
      q: "A postorder solution for Binary Tree Maximum Path Sum should return what to its parent?",
      options: ["The full best path anywhere", "The best single downward branch", "The number of leaves", "The inorder sequence"],
      answer: 1,
      difficulty: "hard",
      category: "Trees",
      explanation: "A parent can extend only one child branch. The two-branch path is used to update the global answer locally.",
    },
  ],

  "leetcode-tries": [
    {
      q: "What does each edge in a standard trie usually represent?",
      options: ["A complete sentence", "A character", "A numeric priority", "A tree height"],
      answer: 1,
      difficulty: "easy",
      category: "Tries",
      explanation: "Trie paths are built character by character, so following a path spells a prefix or complete word.",
    },
    {
      q: "Why does a trie node need an end-of-word marker?",
      options: ["To sort its children", "To distinguish a complete word from a prefix", "To record tree depth", "To delete the root"],
      answer: 1,
      difficulty: "easy",
      category: "Tries",
      explanation: "The path for 'app' also prefixes 'apple'; an end marker records whether that path is itself a stored word.",
    },
    {
      q: "For a word of length L, what is the typical trie lookup time?",
      options: ["O(1)", "O(log L)", "O(L)", "O(L²)"],
      answer: 2,
      difficulty: "medium",
      category: "Tries",
      explanation: "Lookup follows one edge for each character of the word, requiring O(L) steps.",
    },
    {
      q: "In Word Search II, why combine DFS backtracking with a trie?",
      options: ["To sort the board", "To stop exploring paths that match no word prefix", "To avoid marking visited cells", "To make the board binary"],
      answer: 1,
      difficulty: "hard",
      category: "Tries",
      explanation: "The trie prunes DFS immediately when the current board path is not a prefix of any target word.",
    },
  ],

  "leetcode-heaps": [
    {
      q: "Which value is available at the root of a min-heap?",
      options: ["The largest value", "The smallest value", "The newest value", "The median value"],
      answer: 1,
      difficulty: "easy",
      category: "Heaps",
      explanation: "The min-heap property keeps the smallest element at the root for efficient access.",
    },
    {
      q: "What is the time complexity of pushing an item into a binary heap?",
      options: ["O(1) always", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
      difficulty: "easy",
      category: "Heaps",
      explanation: "The inserted value may bubble through the height of the heap, which is O(log n).",
    },
    {
      q: "To find the kth largest element while storing only k values, which structure is most useful?",
      options: ["A min-heap of size k", "A max-heap containing one value", "A stack", "A trie"],
      answer: 0,
      difficulty: "medium",
      category: "Heaps",
      explanation: "A size-k min-heap retains the k largest values seen; its root is the kth largest.",
    },
    {
      q: "How does the two-heap Median Finder divide its data?",
      options: ["Even and odd values", "Lower half in a max-heap and upper half in a min-heap", "Duplicates and unique values", "Sorted and unsorted values"],
      answer: 1,
      difficulty: "hard",
      category: "Heaps",
      explanation: "The max-heap exposes the largest lower value and the min-heap exposes the smallest upper value, making the median accessible.",
    },
  ],

  "leetcode-backtracking": [
    {
      q: "What are the three core steps in a backtracking loop?",
      options: ["Sort, search, merge", "Choose, explore, unchoose", "Push, peek, pop only", "Hash, map, reduce"],
      answer: 1,
      difficulty: "easy",
      category: "Backtracking",
      explanation: "Backtracking makes a choice, recursively explores it, then undoes the choice before trying another option.",
    },
    {
      q: "In the Subsets problem, when is the current path commonly added to the result?",
      options: ["At every recursion node", "Only when its length is n", "Only when it is empty", "After sorting the results"],
      answer: 0,
      difficulty: "easy",
      category: "Backtracking",
      explanation: "Every partial path represents a valid subset, so a copy is recorded at each recursion node.",
    },
    {
      q: "How do you avoid duplicate combinations when candidates contain repeated values?",
      options: ["Never sort the candidates", "Sort and skip equal choices at the same recursion depth", "Use every value twice", "Reverse the answer"],
      answer: 1,
      difficulty: "medium",
      category: "Backtracking",
      explanation: "After sorting, equal sibling choices generate identical branches and can be skipped at the same depth.",
    },
    {
      q: "Which pruning rule is fundamental in the N-Queens problem?",
      options: ["Reject a queen sharing a column or diagonal", "Reject every corner square", "Use only the first row", "Place queens in sorted order"],
      answer: 0,
      difficulty: "hard",
      category: "Backtracking",
      explanation: "A valid placement cannot share a column, main diagonal, or anti-diagonal with a queen already placed.",
    },
  ],

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
