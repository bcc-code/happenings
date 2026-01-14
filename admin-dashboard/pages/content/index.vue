<template>
  <ModuleContainer
    :use-default-header="true"
    header-title="Content"
    header-subtitle="Manage collections and content"
    :sidebar-visible="true"
    sidebar-title="Collections"
  >
    <template #sidebar-content>
      <div class="collections-sidebar">
        <Button
          label="New Collection"
          icon="pi pi-plus"
          class="w-full mb-4"
          @click="showCreateDialog = true"
        />
        
        <div class="collections-list">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-item"
            :class="{ active: selectedCollection?.id === collection.id }"
            @click="selectCollection(collection)"
          >
            <div class="collection-item__name">{{ collection.name }}</div>
            <div class="collection-item__slug">{{ collection.slug }}</div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="selectedCollection" class="content-main">
      <CollectionItemsTable
        :collection="selectedCollection"
        @edit-item="handleEditItem"
        @create-item="handleCreateItem"
      />
    </div>
    <div v-else class="content-empty">
      <p>Select a collection from the sidebar to view its items</p>
    </div>

    <!-- Create Collection Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      modal
      header="Create New Collection"
      :style="{ width: '600px' }"
    >
      <CreateCollectionForm @created="handleCollectionCreated" @cancel="showCreateDialog = false" />
    </Dialog>

    <!-- Edit/Create Item Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      modal
      :header="editingItem?.id ? `Edit ${selectedCollection?.name || 'Item'}` : `Create ${selectedCollection?.name || 'Item'}`"
      :style="{ width: '800px' }"
    >
      <EditCollectionItem
        v-if="selectedCollection && editingItem"
        :collection="selectedCollection"
        :item="editingItem"
        :is-new="!editingItem?.id"
        @saved="handleItemSaved"
        @cancel="showEditDialog = false"
      />
    </Dialog>
  </ModuleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModuleContainer from '~/components/layouts/ModuleContainer.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import CollectionItemsTable from '~/components/modules/content/CollectionItemsTable.vue'
import CreateCollectionForm from '~/components/modules/content/CreateCollectionForm.vue'
import EditCollectionItem from '~/components/modules/content/EditCollectionItem.vue'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

// Protect this route
definePageMeta({
  middleware: 'super-admin-auth',
})

interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  tableName: string
  fields: Array<{
    id: string
    name: string
    slug: string
    type: string
    isRequired: boolean
    isUnique: boolean
  }>
}

const toast = useToast()
const auth = useSuperAdminAuth()
const collections = ref<Collection[]>([])
const selectedCollection = ref<Collection | null>(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingItem = ref<any>(null)

const config = useRuntimeConfig()

async function loadCollections() {
  try {
    const response = await $fetch(`${config.public.apiUrl}/api/admin/collections`, {
      headers: auth.getAuthHeaders(),
    })
    collections.value = response.data
  } catch (error: any) {
    toast.error('Failed to load collections', error.message)
  }
}

function selectCollection(collection: Collection) {
  selectedCollection.value = collection
}

function handleCollectionCreated(collection: Collection) {
  collections.value.push(collection)
  showCreateDialog.value = false
  toast.success('Collection created successfully')
}

function handleEditItem(item: any) {
  editingItem.value = item
  showEditDialog.value = true
}

function handleItemSaved() {
  showEditDialog.value = false
  editingItem.value = null
  // Refresh the table - the CollectionItemsTable will handle this
}

function handleCreateItem() {
  editingItem.value = {} // Empty item for creation
  showEditDialog.value = true
}


onMounted(() => {
  loadCollections()
})
</script>

<style scoped>
.collections-sidebar {
  padding: 1rem;
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.collection-item {
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}

.collection-item:hover {
  background-color: var(--p-surface-hover);
}

.collection-item.active {
  background-color: var(--p-primary-color);
  color: var(--p-primary-color-text);
  border-color: var(--p-primary-color);
}

.collection-item__name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.collection-item__slug {
  font-size: 0.875rem;
  opacity: 0.7;
}

.content-main {
  padding: 1rem;
}

.content-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--p-text-color-secondary);
}
</style>
