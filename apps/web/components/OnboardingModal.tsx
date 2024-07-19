"use client";

import { PlayIcon } from "lucide-react";
import { useWindowSize } from "usehooks-ts";
import { useModal } from "@/components/Modal";
import { YouTubeVideo } from "@/components/YouTubeVideo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OnboardingModal({
  title,
  description,
  videoId,
}: {
  title: string;
  description: React.ReactNode;
  videoId: string;
}) {
  const { isModalOpen, openModal, setIsModalOpen } = useModal();

  return (
    <>
      <Button onClick={openModal} className="text-nowrap">
        <PlayIcon className="mr-2 h-4 w-4" />
        Watch Video
      </Button>

      <OnboardingModalDialog
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={title}
        description={description}
        videoId={videoId}
      />
    </>
  );
}

export function OnboardingModalDialog({
  isModalOpen,
  setIsModalOpen,
  title,
  description,
  videoId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  videoId: string;
}) {
  const { width } = useWindowSize();

  const videoWidth = Math.min(width * 0.75, 1200);
  const videoHeight = videoWidth * (675 / 1200);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="min-w-[350px] sm:min-w-[600px] md:min-w-[750px] lg:min-w-[880px] xl:min-w-[1280px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <YouTubeVideo
          videoId={videoId}
          iframeClassName="mx-auto"
          opts={{
            height: `${videoHeight}`,
            width: `${videoWidth}`,
            playerVars: {
              // https://developers.google.com/youtube/player_parameters
              autoplay: 1,
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
