<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  item: {
    id: string;
    file: File;
    status: 'pending' | 'analyzing' | 'success' | 'error';
    data: {
      date: string;
      name: string;
      currency: string;
      amount: string;
    };
    thumbnail: string;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(['update', 'remove']);

const formattedFilename = computed(() => {
  const { date, name, currency, amount } = props.item.data;
  const ext = props.item.file.name.split('.').pop();
  return `${date}-${name}-${currency}${amount}.${ext}`;
});

function updateField(field: keyof typeof props.item.data, value: string) {
  emit('update', { ...props.item.data, [field]: value });
}
</script>

<template>
  <div class="bg-[#18181b] rounded-xl p-4 mb-4 border border-white/5 transition-all w-full flex flex-col gap-4">
    <div class="flex gap-4">
      <!-- Thumbnail -->
      <div class="w-20 h-20 shrink-0 bg-black/50 rounded-lg overflow-hidden border border-white/10 relative">
        <img :src="item.thumbnail" class="w-full h-full object-cover" alt="Receipt">
        <div v-if="item.status === 'analyzing'" class="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <div v-if="item.status === 'error'" class="absolute inset-0 bg-red-500/20 flex items-center justify-center text-red-500 font-bold">
          !
        </div>
      </div>

      <!-- Fields -->
      <div class="flex-1 grid grid-cols-2 gap-3">
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-gray-500 block mb-1">日付 (YYYY-MM-DD)</label>
          <input 
            type="date"
            :value="item.data.date"
            @input="(e) => updateField('date', (e.target as HTMLInputElement).value)"
            class="w-full bg-[#27272a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-gray-500 block mb-1">店名</label>
          <input 
            type="text"
            :value="item.data.name"
            @input="(e) => updateField('name', (e.target as HTMLInputElement).value)"
            class="w-full bg-[#27272a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="店名"
          >
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">通貨</label>
          <input 
            type="text"
            :value="item.data.currency"
            @input="(e) => updateField('currency', (e.target as HTMLInputElement).value)"
            class="w-full bg-[#27272a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="¥"
          >
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">金額</label>
          <input 
            type="number"
            :value="item.data.amount"
            @input="(e) => updateField('amount', (e.target as HTMLInputElement).value)"
            class="w-full bg-[#27272a] border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="0"
          >
        </div>
      </div>
    </div>

    <!-- Filename Preview & Actions -->
    <div class="flex items-center justify-between pt-2 border-t border-white/5">
      <div class="text-xs text-gray-400 truncate max-w-[200px]">
        {{ formattedFilename }}
      </div>
      <div class="flex gap-2">
        <button 
          v-if="item.status === 'success' || item.status === 'pending'" 
          @click="$emit('download', item)"
          class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
        >
          保存
        </button>
        <button 
          @click="$emit('remove')"
          class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  </div>
</template>
