<script>
  export let height = "24";
  export let width = "24";
  export let color = "currentColor";
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- gRPC icon: representing client-server communication with streaming -->
  <path d="M2 7h4v10H2zm16 0h4v10h-4z" fill={color} stroke="none" />
  <path d="M8 5h8M8 12h8M8 19h8" />
  <circle cx="12" cy="5" r="1.5" fill={color} />
  <circle cx="12" cy="12" r="1.5" fill={color} />
  <circle cx="12" cy="19" r="1.5" fill={color} />
</svg>
