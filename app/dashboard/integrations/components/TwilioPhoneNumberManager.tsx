"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  Phone, 
  Plus, 
  RefreshCw, 
  Search, 
  Settings, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  dateCreated: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  voiceUrl: string;
  smsUrl: string;
}

interface AvailablePhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  isoCountry: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

interface TwilioPhoneNumberManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
}

export function TwilioPhoneNumberManager({ 
  open, 
  onOpenChange, 
  teamId 
}: TwilioPhoneNumberManagerProps) {
  const [activeTab, setActiveTab] = useState("existing");
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [country, setCountry] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<AvailablePhoneNumber | null>(null);
  const [friendlyName, setFriendlyName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  // Fetch existing phone numbers when the dialog opens
  useEffect(() => {
    if (open) {
      fetchPhoneNumbers();
    }
  }, [open, teamId]);

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const url = teamId
        ? `/api/integrations/twilio/numbers?teamId=${teamId}`
        : '/api/integrations/twilio/numbers';
      
      const response = await fetch(url);
      
      // Even if we get a 404, we'll still try to parse the response
      // as it might contain mock data or error information
      const data = await response.json();
      
      if (data.error) {
        console.warn("Warning fetching phone numbers:", data.error);
        // Don't show an error toast for expected errors like "not connected"
        if (data.error !== 'Twilio integration not found or not connected') {
          toast({
            title: "Warning",
            description: data.error,
            variant: "default",
          });
        }
        setPhoneNumbers([]);
      } else {
        setPhoneNumbers(data.phoneNumbers || []);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch phone numbers. Please try again later.",
        variant: "destructive",
      });
      setPhoneNumbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAvailableNumbers = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        listAvailable: "true",
        country,
      });
      
      if (teamId) {
        params.append("teamId", teamId);
      }
      
      if (areaCode) {
        params.append("areaCode", areaCode);
      }
      
      const response = await fetch(`/api/integrations/twilio/numbers?${params.toString()}`);
      const data = await response.json();
      
      if (data.error) {
        console.warn("Warning searching for numbers:", data.error);
        toast({
          title: "Warning",
          description: data.error,
          variant: "default",
        });
        setAvailableNumbers([]);
      } else {
        setAvailableNumbers(data.availableNumbers || []);
        
        if (data.availableNumbers?.length === 0) {
          toast({
            title: "No numbers found",
            description: "No available numbers match your search criteria",
          });
        }
      }
    } catch (error) {
      console.error("Error searching for numbers:", error);
      toast({
        title: "Error",
        description: "Failed to search for available numbers. Please try again later.",
        variant: "destructive",
      });
      setAvailableNumbers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const purchaseNumber = async (phoneNumber: string) => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/integrations/twilio/numbers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(teamId ? { teamId } : {}),
          phoneNumber,
          friendlyName: friendlyName || `Phone Number`,
          action: "purchase",
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Error purchasing number:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to purchase phone number",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Phone number purchased successfully",
        });
        
        // Reset state and fetch updated list
        setSelectedNumber(null);
        setFriendlyName("");
        setActiveTab("existing");
        fetchPhoneNumbers();
      }
    } catch (error) {
      console.error("Error purchasing number:", error);
      toast({
        title: "Error",
        description: "Failed to purchase phone number. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const releaseNumber = async (sid: string) => {
    if (!confirm("Are you sure you want to release this phone number? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const url = teamId
        ? `/api/integrations/twilio/numbers?teamId=${teamId}&sid=${sid}`
        : `/api/integrations/twilio/numbers?sid=${sid}`;
        
      const response = await fetch(url, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Error releasing number:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to release phone number",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Phone number released successfully",
        });
        
        // Fetch updated list
        fetchPhoneNumbers();
      }
    } catch (error) {
      console.error("Error releasing number:", error);
      toast({
        title: "Error",
        description: "Failed to release phone number. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Twilio Phone Numbers</DialogTitle>
          <DialogDescription>
            View, purchase, and configure your Twilio phone numbers.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Numbers</TabsTrigger>
            <TabsTrigger value="purchase">Purchase New Number</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPhoneNumbers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : phoneNumbers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Phone Numbers</h3>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    You don't have any phone numbers yet. Purchase a number to get started.
                  </p>
                  <Button onClick={() => setActiveTab("purchase")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Purchase Number
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Friendly Name</TableHead>
                      <TableHead>Capabilities</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phoneNumbers.map((number) => (
                      <TableRow key={number.sid}>
                        <TableCell className="font-medium">{number.phoneNumber}</TableCell>
                        <TableCell>{number.friendlyName}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {number.capabilities.voice && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                Voice
                              </Badge>
                            )}
                            {number.capabilities.sms && (
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                SMS
                              </Badge>
                            )}
                            {number.capabilities.mms && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                                MMS
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(number.dateCreated).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => releaseNumber(number.sid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search for Available Numbers</CardTitle>
                <CardDescription>
                  Search for available phone numbers by country and area code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area-code">Area Code (Optional)</Label>
                    <Input 
                      id="area-code" 
                      placeholder="e.g. 415" 
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={searchAvailableNumbers}
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search for Numbers
                </Button>
              </CardFooter>
            </Card>
            
            {availableNumbers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Numbers</CardTitle>
                  <CardDescription>
                    Select a number to purchase.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Capabilities</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableNumbers.map((number) => (
                          <TableRow key={number.phoneNumber}>
                            <TableCell className="font-medium">{number.phoneNumber}</TableCell>
                            <TableCell>
                              {number.locality ? `${number.locality}, ` : ''}
                              {number.region}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {number.capabilities.voice && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                    Voice
                                  </Badge>
                                )}
                                {number.capabilities.sms && (
                                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                    SMS
                                  </Badge>
                                )}
                                {number.capabilities.mms && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                                    MMS
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm"
                                onClick={() => setSelectedNumber(number)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {selectedNumber && (
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Number</CardTitle>
                  <CardDescription>
                    Configure and purchase the selected number.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-md">
                    <p className="font-medium text-lg">{selectedNumber.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedNumber.locality ? `${selectedNumber.locality}, ` : ''}
                      {selectedNumber.region}, {selectedNumber.isoCountry}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="friendly-name">Friendly Name</Label>
                    <Input 
                      id="friendly-name" 
                      placeholder="e.g. Sales Line, Support Number" 
                      value={friendlyName}
                      onChange={(e) => setFriendlyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      A descriptive name to help you identify this number.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedNumber(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => purchaseNumber(selectedNumber.phoneNumber)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Purchase Number
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}