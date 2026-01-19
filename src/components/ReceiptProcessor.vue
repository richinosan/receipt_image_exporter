<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ReceiptItem from './ReceiptItem.vue';

interface ReceiptData {
  date: string;
  name: string;
  currency: string;
  amount: string;
}

interface Item {
  id: string;
  file: File;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  data: ReceiptData;
  thumbnail: string;
}

const apiKey = ref('');
const items = ref<Item[]>([]);
const isDragging = ref(false);
const showApiKeyInput = ref(false);

onMounted(() => {
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) apiKey.value = savedKey;
});

watch(apiKey, (val) => {
  localStorage.setItem('gemini_api_key', val);
});

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files) addFiles(files);
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) addFiles(input.files);
};

const addFiles = (fileList: FileList) => {
  Array.from(fileList).forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const item: Item = {
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending',
        data: {
          date: new Date().toISOString().split('T')[0],
          name: '',
          currency: '¥',
          amount: ''
        },
        thumbnail: e.target?.result as string
      };
      items.value.unshift(item);
      analyzeItem(item);
    };
    reader.readAsDataURL(file);
  });
};

const analyzeItem = async (item: Item) => {
  item.status = 'analyzing';
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: item.thumbnail,
        apiKey: apiKey.value
      })
    });

    if (!response.ok) throw new Error('Analysis failed');

    const result = await response.json();
    item.data = { ...item.data, ...result };
    item.status = 'success';
  } catch (error) {
    console.error(error);
    item.status = 'error';
  }
};

const updateItem = (id: string, newData: ReceiptData) => {
  const item = items.value.find(i => i.id === id);
  if (item) item.data = newData;
};

const removeItem = (id: string) => {
  items.value = items.value.filter(i => i.id !== id);
};

const downloadItem = (item: Item) => {
  const { date, name, currency, amount } = item.data;
  const ext = item.file.name.split('.').pop() || 'jpg';
  const filename = `${date}-${name}-${currency}${amount}.${ext}`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(item.file);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="p-4 max-w-lg mx-auto pb-32">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold font-outfit text-white">レシートエクスポーター</h1>
      <button 
        @click="showApiKeyInput = !showApiKeyInput"
        class="text-xs text-gray-500 hover:text-white transition-colors"
      >
        {{ showApiKeyInput ? 'キーを隠す' : 'APIキー' }}
      </button>
    </header>

    <!-- API Key Input -->
    <div v-if="showApiKeyInput" class="mb-6 bg-[#18181b] p-3 rounded-lg border border-white/5 animate-in fade-in slide-in-from-top-2">
      <label class="block text-xs text-gray-500 mb-1">Gemini APIキー (任意)</label>
      <input 
        v-model="apiKey"
        type="password"
        class="w-full bg-[#27272a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        placeholder="デフォルトを使用しない場合は入力してください"
      >
    </div>

    <!-- Drop Zone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
      class="border-2 border-dashed rounded-xl p-8 mb-8 text-center cursor-pointer transition-colors relative overflow-hidden group"
      :class="isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'"
    >
      <input 
        ref="fileInput" 
        type="file" 
        multiple 
        accept="image/*" 
        class="hidden" 
        @change="handleFileSelect"
      >
      <div class="pointer-events-none relative z-10">
        <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
          📷
        </div>
        <p class="text-sm text-white font-medium">ここをタップ または レシートをドロップ</p>
        <p class="text-xs text-gray-500 mt-1">JPG, PNG 対応</p>
      </div>
    </div>

    <!-- List -->
    <transition-group 
      name="list" 
      tag="div" 
      class="flex flex-col gap-4"
    >
      <ReceiptItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @update="(data) => updateItem(item.id, data)"
        @remove="removeItem(item.id)"
        @download="downloadItem"
      />
    </transition-group>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center text-gray-600 py-12">
      レシートはまだありません
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
