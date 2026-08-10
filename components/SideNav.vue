<script setup lang="ts">
interface NavItem {
  title: string
  _path: string
  children?: NavItem[]
}

defineProps<{ items: NavItem[] }>()

function leafChildren(item: NavItem): NavItem[] {
  // Hide the section index page from the child list (the section title links to it)
  return (item.children ?? []).filter((c) => c._path !== item._path)
}
</script>

<template>
  <ul class="sidenav-list">
    <li v-for="item in items" :key="item._path" class="nav-section">
      <template v-if="item.children && leafChildren(item).length">
        <span class="nav-section-title">{{ item.title }}</span>
        <ul class="nav-sub">
          <li v-if="item.children.some((c) => c._path === item._path)">
            <NuxtLink :to="item._path" class="nav-link">Overview</NuxtLink>
          </li>
          <li v-for="child in leafChildren(item)" :key="child._path">
            <template v-if="child.children && child.children.length > 1">
              <NuxtLink :to="child._path" class="nav-link">{{ child.title }}</NuxtLink>
              <ul class="nav-sub">
                <li
                  v-for="grand in child.children.filter((g) => g._path !== child._path)"
                  :key="grand._path"
                >
                  <NuxtLink :to="grand._path" class="nav-link nav-link--deep">{{ grand.title }}</NuxtLink>
                </li>
              </ul>
            </template>
            <NuxtLink v-else :to="child._path" class="nav-link">{{ child.title }}</NuxtLink>
          </li>
        </ul>
      </template>
      <NuxtLink v-else :to="item._path" class="nav-link nav-link--top">{{ item.title }}</NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.sidenav-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0 3rem;
}

.sidenav-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link--top {
  font-weight: 600;
  color: var(--cds-text-primary, #161616);
}

.nav-link--deep {
  padding-left: 3rem !important;
  font-size: 0.8125rem !important;
}
</style>
