'use client';

import { useState, useEffect } from 'react';
import { StadiumBackground } from '../ui/StadiumBackground';
import { CategoriesPanel } from './CategoriesPanel';
import { ChannelsPanel } from './ChannelsPanel';
import { ProgramGuidePanel } from './ProgramGuidePanel';
import { useStreamingUIStore } from '../../store/streaming-ui-store';
import { Category } from '../../types/streaming';
import { Channel } from '../../types/streaming';
import { Program } from '../../types/streaming';
import { xtreamApi } from '../../lib/xtream-api';
import { useDebounce } from '../../hooks/use-debounce';

interface StreamingOverlayProps {
  categories: Category[];
}

export function StreamingOverlay({ categories }: StreamingOverlayProps) {
  const { selectedCategoryId, selectedChannelId, setSelectedCategory, setSelectedChannel } =
    useStreamingUIStore();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<Error | null>(null);

  const debouncedCategoryId = useDebounce(selectedCategoryId, 300);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!debouncedCategoryId) {
        setChannels([]);
        return;
      }

      setChannelsLoading(true);
      try {
        const streams = await xtreamApi.getStreams(debouncedCategoryId);
        setChannels(
          streams.map((s) => ({
            num: s.num,
            name: s.name,
            stream_id: s.stream_id,
            stream_icon: s.stream_icon,
            category_id: s.category_id,
            epg_channel_id: s.epg_channel_id,
          }))
        );
      } catch {
        setChannels([]);
      } finally {
        setChannelsLoading(false);
      }
    };

    fetchChannels();
  }, [debouncedCategoryId]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedChannelId) {
        setPrograms([]);
        return;
      }

      setProgramsLoading(true);
      setProgramsError(null);
      try {
        const epgListings = await xtreamApi.getEPG(selectedChannelId);
        const enrichedPrograms: Program[] = epgListings.map((epg) => ({
          id: epg.id,
          title: epg.title,
          start: epg.start,
          end: epg.end,
          isLive: false,
        }));
        setPrograms(enrichedPrograms);
      } catch (err) {
        setProgramsError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
    const interval = setInterval(fetchPrograms, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedChannelId]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <StadiumBackground />

      <div className="absolute inset-0 flex items-stretch justify-center gap-4 p-6">
        <CategoriesPanel
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          isLoading={channelsLoading && !debouncedCategoryId}
          onCategorySelect={(id) => {
            setSelectedCategory(id);
            setSelectedChannel(null);
          }}
        />

        <ChannelsPanel
          channels={channels}
          selectedChannelId={selectedChannelId}
          isLoading={channelsLoading}
          onChannelSelect={setSelectedChannel}
        />

        <ProgramGuidePanel
          programs={programs}
          isLoading={programsLoading}
          error={programsError}
          onRetry={() => {
            if (selectedChannelId) {
              setSelectedChannel(selectedChannelId);
            }
          }}
        />
      </div>
    </div>
  );
}
