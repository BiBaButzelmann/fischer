import {
  Users,
  User,
  Wrench,
  ClipboardEdit,
  Shield,
  Gavel,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { RolesData } from "../../db/types/role";
import { matchDays } from "../../constants/constants";

type RoleSummaryProps = RolesData & {
  showEditButton?: boolean;
};

export function RoleSummary({
  participant,
  juror,
  referee,
  matchEnteringHelper,
  setupHelper,
  showEditButton = false,
}: RoleSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Meine Anmeldungen</CardTitle>
          </div>{" "}
          {showEditButton && (
            <Button asChild size="sm">
              <Link href="/klubturnier-anmeldung">Anmeldung anpassen</Link>
            </Button>
          )}
        </div>
        <CardDescription>
          Übersicht deiner Anmeldungen für das Turnier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 1. Spieler (Participant) */}
          {participant && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Spieler</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="border rounded p-2">
                  <span className="text-muted-foreground">Schachverein:</span>
                  <p className="font-medium mt-1">{participant.chessClub}</p>
                </div>

                {/* Title and Ratings Row */}
                <div className="flex flex-wrap gap-2">
                  {participant.title && participant.title !== "noTitle" && (
                    <div className="border rounded px-2 py-1 flex items-center gap-1">
                      <span className="text-muted-foreground">Titel:</span>
                      <span className="font-medium">{participant.title}</span>
                    </div>
                  )}
                  {participant.dwzRating && (
                    <div className="border rounded px-2 py-1 flex items-center gap-1">
                      <span className="text-muted-foreground">DWZ:</span>
                      <span className="font-medium">
                        {participant.dwzRating}
                      </span>
                    </div>
                  )}
                  {participant.fideRating && (
                    <div className="border rounded px-2 py-1 flex items-center gap-1">
                      <span className="text-muted-foreground">Elo:</span>
                      <span className="font-medium">
                        {participant.fideRating}
                      </span>
                    </div>
                  )}
                </div>

                {/* FIDE ID and Nationality Row */}
                {(participant.fideId || participant.nationality) && (
                  <div className="flex flex-wrap gap-2">
                    {participant.fideId && (
                      <div className="border rounded px-2 py-1 flex items-center gap-1">
                        <span className="text-muted-foreground">FIDE ID:</span>
                        <span className="font-medium">
                          {participant.fideId}
                        </span>
                      </div>
                    )}
                    {participant.nationality && (
                      <div className="border rounded px-2 py-1 flex items-center gap-1">
                        <span className="text-muted-foreground">
                          Nationalität:
                        </span>
                        <Badge variant="outline" className="text-xs ml-1">
                          {participant.nationality}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="border rounded p-2">
                  <span className="text-muted-foreground">
                    Bevorzugter Spieltag:
                  </span>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {matchDays[participant.preferredMatchDay]}
                    </Badge>
                  </div>
                </div>

                {participant.secondaryMatchDays.length > 0 && (
                  <div className="border rounded p-2">
                    <span className="text-muted-foreground">
                      Alternative Spieltage:
                    </span>
                    <div className="mt-1">
                      {participant.secondaryMatchDays.map((day, index) => (
                        <span key={day} className="text-sm">
                          {matchDays[day]}
                          {index < participant.secondaryMatchDays.length - 1 &&
                            ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Aufbauhelfer (Setup Helper) */}
          {setupHelper && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Aufbauhelfer</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="border rounded p-2 flex items-center gap-1">
                  <span className="text-muted-foreground">
                    Bevorzugter Tag:
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {matchDays[setupHelper.preferredMatchDay]}
                  </Badge>
                </div>
                {setupHelper.secondaryMatchDays.length > 0 && (
                  <div className="border rounded p-2">
                    <span className="text-muted-foreground">
                      Alternative Tage:
                    </span>
                    <div className="mt-1">
                      {setupHelper.secondaryMatchDays.map((day, index) => (
                        <span key={day} className="text-sm">
                          {matchDays[day]}
                          {index < setupHelper.secondaryMatchDays.length - 1 &&
                            ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Eingabehelfer (Match Entering Helper) */}
          {matchEnteringHelper && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardEdit className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Eingabehelfer</h3>
              </div>
              <div className="text-sm">
                <div className="border rounded p-2 flex items-center gap-2">
                  <ClipboardEdit className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Anzahl Gruppen:</span>
                  <span className="font-medium">
                    {matchEnteringHelper.numberOfGroupsToEnter}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Schiedsrichter (Referee) */}
          {referee && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Schiedsrichter</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="border rounded p-2 flex items-center gap-1">
                  <span className="text-muted-foreground">
                    Bevorzugter Tag:
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {matchDays[referee.preferredMatchDay]}
                  </Badge>
                </div>
                {referee.secondaryMatchDays.length > 0 && (
                  <div className="border rounded p-2">
                    <span className="text-muted-foreground">
                      Alternative Tage:
                    </span>
                    <div className="mt-1">
                      {referee.secondaryMatchDays.map((day, index) => (
                        <span key={day} className="text-sm">
                          {matchDays[day]}
                          {index < referee.secondaryMatchDays.length - 1 &&
                            ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Turniergericht (Juror) */}
          {juror && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">Turniergericht</h3>
              </div>
              <div className="text-sm">
                <div className="border rounded p-2 flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">Angemeldet</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
