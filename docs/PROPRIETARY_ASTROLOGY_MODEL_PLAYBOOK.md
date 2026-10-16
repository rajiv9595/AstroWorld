# AstroWorld Proprietary AI Astrologer: Architecture & Fine-Tuning Playbook

This playbook outlines the complete strategic and technical blueprint to build and operate a **world-class, human-grade AI Astrologer** that matches the conversational depth and empathy of top-tier ChatGPT and Gemini models, backed by 100% deterministic Vedic astrological mathematics.

---

## 1. System Architecture: The Neuro-Symbolic Model

The fatal mistake made by many AI astrology platforms is asking a raw Large Language Model to calculate planetary degrees, Vimshottari dashas, or divisional varga charts within its own neural weights. **LLMs cannot perform spherical trigonometry reliably.**

AstroWorld solves this with a **Hybrid Neuro-Symbolic Engine**:

```
                       ┌──────────────────────────────────────────────┐
                       │          User Consultation Request           │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │    Question Understanding & Intent Router    │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                       SYMBOLIC DETERMINISTIC KERNEL (shared/engine)                     │
 │  - Swiss Ephemeris / Parashara Siddhanta (0.001° planetary precision)                   │
 │  - Exact D1 (Rasi), D9 (Navamsha), D10 (Dashamsha), and Shodashavarga charts            │
 │  - Vimshottari Mahadasha, Antardasha, and Pratyantardasha balance down to exact seconds  │
 │  - Gochara (Real-time Transits), Sarvashtakavarga (SAV), Shadbala, and Classical Yogas  │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │  Astrological Reasoning & Grounding Context  │
                       │   (Structured placements, yogas & windows)   │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                   NEURAL MASTER ASTROLOGER NARRATION (Gemini / Llama-3)                 │
 │  - Persona: Revered Acharya & Empathetic Jyotish Mentor                                │
 │  - Emotional intelligence & psychological resonance                                    │
 │  - Purushartha perspective: Karma as seasonal weather; conscious will as navigation    │
 │  - Conversational temperature: 0.65 for articulate, soulful storytelling               │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │  Output Delivery: Mind-Blowing Reading       │
                       └──────────────────────────────────────────────┘
```

---

## 2. Elevating Live Gemini to Master Level (Phase 1 — Operational)

The current platform live narration has been elevated from robotic compliance to **Master Astrologer excellence**:

1. **System Persona (`narratorPrompt.ts`)**:
   - Replaced clinical rules with an authentic **Master Jyotishi Mentor** persona.
   - Enforces **Answer-First**: The core verdict is delivered directly in the first 1–2 sentences.
   - Weaves psychological archetypes, life struggles, and spiritual growth into the chart interpretation.
   - Eliminates robotic boilerplate (`"According to your chart..."`, `"Based on the data provided..."`).

2. **Dynamic Temperature Tuning (`geminiNarrator.ts`)**:
   - **Primary Model (`gemini-3.8-flash`)**: Configured to `temperature: 0.65` for expressive, fluent, and warm prose.
   - **Fallback Model (`gemini-3.1-flash-lite`)**: Configured to `temperature: 0.55`.
   - **Repair Loop**: Preserved at `temperature: 0.2` for surgical compliance fixes if any unapproved date or forbidden entity is detected.

---

## 3. The Proprietary Model Dataset Pipeline (Phase 2 — Active)

To transition from relying entirely on proprietary external APIs to owning your **proprietary fine-tuned weights**, AstroWorld includes a built-in dataset pipeline:

### Directory Structure:
- `backend/src/ai_v2/dataset/trainingSchemas.ts`: Standard schemas for OpenAI, Gemini, and Llama-3 JSONL datasets.
- `backend/src/ai_v2/dataset/goldenSeedDataset.ts`: Golden training pairs crafted by veteran Vedic astrologers across Career, Marriage, Finance, Dasha Sandhi, and Life Purpose.
- `backend/src/ai_v2/dataset/datasetCollector.ts`: Aggregates, audits, and formats consultation data.
- `backend/scripts/export-finetune-dataset.ts`: CLI exporter.

### Generating Dataset Files:
Run in your terminal:
```bash
npm run dataset:export
```
This exports three ready-to-train datasets in `backend/datasets/`:
1. `astroworld_finetune_openai.jsonl` (for OpenAI GPT-4o / GPT-4o-mini fine-tuning)
2. `astroworld_finetune_gemini.jsonl` (for Google AI Studio / Vertex AI Gemini 1.5/2.0 tuning)
3. `astroworld_finetune_llama3.jsonl` (for Llama-3.3-70B / Mistral Large via Unsloth / Axolotl)

---

## 4. Fine-Tuning Guide: Training Llama-3.3-70B / Gemini 2.0

### Path A: Gemini 1.5/2.0 Flash Tuning (Fastest, Cloud-Native)
1. Go to [Google AI Studio Tuning Console](https://aistudio.google.com/).
2. Select **Create Tuned Model** > choose `gemini-1.5-flash` or `gemini-2.0-flash`.
3. Upload `backend/datasets/astroworld_finetune_gemini.jsonl`.
4. Recommended Hyperparameters:
   - **Epochs**: 3
   - **Learning Rate Multiplier**: 1.0 (or default)
   - **Batch Size**: 4
5. Deploy the resulting endpoint ID directly into AstroWorld's `.env`:
   ```env
   GEMINI_PRIMARY_MODEL="tunedModels/astroworld-master-jyotishi-v1"
   ```

### Path B: Self-Hosted Llama-3.3-70B-Instruct (100% Independent & Private)
For total independence from big tech APIs, fine-tune `meta-llama/Llama-3.3-70B-Instruct` using **Unsloth** or **Axolotl** on a single A100 GPU (80GB):

#### QLoRA Configuration (`config.yaml`):
```yaml
base_model: meta-llama/Llama-3.3-70B-Instruct
load_in_4bit: true

dataset:
  path: backend/datasets/astroworld_finetune_llama3.jsonl
  type: alpaca

adapter: qlora
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj

sequence_len: 4096
sample_packing: true
learning_rate: 0.0002
lr_scheduler: cosine
warmup_ratio: 0.03
epochs: 3
micro_batch_size: 2
gradient_accumulation_steps: 8
```

#### Serving with vLLM:
Once fine-tuned, merge the LoRA weights and serve with **vLLM** for blazing fast 80+ tokens/second inference:
```bash
python3 -m vllm.entrypoints.openai.api_server \
  --model ./astroworld-llama3-70b-master \
  --port 8000 \
  --gpu-memory-utilization 0.95 \
  --max-model-len 4096
```
Connect AstroWorld to your private model by pointing the OpenAI-compatible client endpoint to `http://localhost:8000/v1`.

---

## 5. Ongoing Data Curation Strategy (The Flywheel)

To expand the dataset from the 5 golden seed cases to 2,000+ mastery examples:

1. **Production Feedback Harvesting**:
   - Capture real user queries and the deterministic chart context packets.
   - When users rate a response 5 stars (or give positive thumbs-up), mark the conversation turn as a candidate.
2. **Astrologer-in-the-Loop Review**:
   - Have senior consulting astrologers review and polish candidate turns in an admin review tool.
   - Run `npm run dataset:export` to update the training corpus continuously.
3. **Continuous Re-Tuning**:
   - Retrain every 500 validated cases to keep the model continuously advancing in empathy, depth, and conversational magic.
