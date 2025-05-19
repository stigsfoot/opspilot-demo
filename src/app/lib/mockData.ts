/**
 * Mock data for frontend testing
 * This file provides realistic mock responses for different IT issue categories
 */

import { Trace, TraceClassification, TraceStep } from "./types";

// Generate a random trace ID for mocks
export function generateMockTraceId(): string {
  return 'mock-' + Math.random().toString(36).substring(2, 15);
}

// Mock issue categories
export const ISSUE_CATEGORIES = [
  'password_reset',
  'network_connectivity',
  'software_installation',
  'hardware_failure',
  'printer_issues',
  'email_issues',
  'access_permission',
  'security_incident',
];

// Mock classification results for each category
export const MOCK_CLASSIFICATIONS: Record<string, TraceClassification> = {
  password_reset: {
    results: {
      "password_reset": 0.92,
      "access_permission": 0.20,
      "software_installation": 0.10,
      "hardware_failure": 0.05,
      "network_connectivity": 0.05,
      "email_issues": 0.05,
      "printer_issues": 0.05,
      "security_incident": 0.05
    },
    top_categories: [
      { category: "password_reset", confidence: 0.92 },
      { category: "access_permission", confidence: 0.20 }
    ]
  },
  
  network_connectivity: {
    results: {
      "network_connectivity": 0.90,
      "hardware_failure": 0.15,
      "security_incident": 0.10,
      "software_installation": 0.05,
      "password_reset": 0.05,
      "access_permission": 0.05,
      "email_issues": 0.05,
      "printer_issues": 0.05
    },
    top_categories: [
      { category: "network_connectivity", confidence: 0.90 },
      { category: "hardware_failure", confidence: 0.15 }
    ]
  },
  
  software_installation: {
    results: {
      "software_installation": 0.88,
      "access_permission": 0.25,
      "hardware_failure": 0.10,
      "network_connectivity": 0.05,
      "password_reset": 0.05,
      "email_issues": 0.05,
      "printer_issues": 0.05,
      "security_incident": 0.05
    },
    top_categories: [
      { category: "software_installation", confidence: 0.88 },
      { category: "access_permission", confidence: 0.25 }
    ]
  },
  
  hardware_failure: {
    results: {
      "hardware_failure": 0.85,
      "network_connectivity": 0.15,
      "software_installation": 0.10,
      "printer_issues": 0.10,
      "password_reset": 0.05,
      "access_permission": 0.05,
      "email_issues": 0.05,
      "security_incident": 0.05
    },
    top_categories: [
      { category: "hardware_failure", confidence: 0.85 },
      { category: "network_connectivity", confidence: 0.15 }
    ]
  },
  
  printer_issues: {
    results: {
      "printer_issues": 0.88,
      "hardware_failure": 0.15,
      "software_installation": 0.10,
      "network_connectivity": 0.05,
      "password_reset": 0.05,
      "access_permission": 0.05,
      "email_issues": 0.05,
      "security_incident": 0.05
    },
    top_categories: [
      { category: "printer_issues", confidence: 0.88 },
      { category: "hardware_failure", confidence: 0.15 }
    ]
  },
  
  email_issues: {
    results: {
      "email_issues": 0.86,
      "network_connectivity": 0.20,
      "password_reset": 0.15,
      "access_permission": 0.10,
      "software_installation": 0.05,
      "hardware_failure": 0.05,
      "printer_issues": 0.05,
      "security_incident": 0.05
    },
    top_categories: [
      { category: "email_issues", confidence: 0.86 },
      { category: "network_connectivity", confidence: 0.20 }
    ]
  },
  
  access_permission: {
    results: {
      "access_permission": 0.89,
      "password_reset": 0.25,
      "security_incident": 0.15,
      "software_installation": 0.05,
      "hardware_failure": 0.05,
      "network_connectivity": 0.05,
      "email_issues": 0.05,
      "printer_issues": 0.05
    },
    top_categories: [
      { category: "access_permission", confidence: 0.89 },
      { category: "password_reset", confidence: 0.25 }
    ]
  },
  
  security_incident: {
    results: {
      "security_incident": 0.92,
      "access_permission": 0.20,
      "network_connectivity": 0.15,
      "email_issues": 0.10,
      "software_installation": 0.05,
      "hardware_failure": 0.05,
      "password_reset": 0.05,
      "printer_issues": 0.05
    },
    top_categories: [
      { category: "security_incident", confidence: 0.92 },
      { category: "access_permission", confidence: 0.20 }
    ]
  },
  
  general: {
    results: {
      "hardware_failure": 0.20,
      "software_installation": 0.20,
      "network_connectivity": 0.20,
      "password_reset": 0.20,
      "access_permission": 0.20,
      "email_issues": 0.20,
      "printer_issues": 0.20,
      "security_incident": 0.10
    },
    top_categories: [
      { category: "hardware_failure", confidence: 0.20 },
      { category: "software_installation", confidence: 0.20 }
    ]
  }
};

// Mock reasoning steps and responses for each category
export const MOCK_RESPONSES: Record<string, {
  steps: TraceStep[];
  response: string;
  kb_articles?: any[];
}> = {
  password_reset: {
    steps: [
      {
        step: 1,
        thought: "This appears to be a password reset issue. I need to classify it first to confirm.",
        tool: "classify_issue",
        tool_input: "I forgot my password and can't log in to my account",
        tool_output: MOCK_CLASSIFICATIONS.password_reset.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a password reset issue with high confidence. I should fetch the appropriate solution from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "password_reset",
          "description": "I forgot my password and can't log in to my account"
        },
        tool_output: [
          {
            "id": "KB-PR-001",
            "title": "How to reset your password",
            "content": "1. Go to the password reset portal at https://reset.company.com\n2. Enter your username\n3. Follow the email instructions sent to your registered email\n4. Create a new password following the security guidelines",
            "relevance": 1.8
          },
          {
            "id": "KB-PR-003",
            "title": "Account lockout resolution",
            "content": "If your account is locked due to too many failed login attempts:\n1. Wait 15 minutes for the automatic lockout to expire\n2. Use the 'Forgot Password' option if you need to reset immediately\n3. Contact the Service Desk at x1234 if you continue to experience issues",
            "relevance": 1.2
          }
        ]
      },
      {
        step: 3,
        thought: "Now I have the relevant information from the knowledge base. I'll construct a helpful response that addresses the user's specific issue and provides clear steps to reset their password."
      }
    ],
    response: "I understand you're having trouble logging in because you forgot your password. Here's how you can reset it:\n\n1. Go to the password reset portal at https://reset.company.com\n2. Enter your username\n3. Follow the email instructions sent to your registered email\n4. Create a new password following the security guidelines\n\nIf your account is locked due to too many failed login attempts, you may need to wait 15 minutes for the automatic lockout to expire before trying the reset process.\n\nIs there anything else you need help with regarding your password reset?",
    kb_articles: [
      {
        "id": "KB-PR-001",
        "title": "How to reset your password",
        "content": "1. Go to the password reset portal at https://reset.company.com\n2. Enter your username\n3. Follow the email instructions sent to your registered email\n4. Create a new password following the security guidelines",
        "relevance": 1.8
      },
      {
        "id": "KB-PR-003",
        "title": "Account lockout resolution",
        "content": "If your account is locked due to too many failed login attempts:\n1. Wait 15 minutes for the automatic lockout to expire\n2. Use the 'Forgot Password' option if you need to reset immediately\n3. Contact the Service Desk at x1234 if you continue to experience issues",
        "relevance": 1.2
      }
    ]
  },
  
  network_connectivity: {
    steps: [
      {
        step: 1,
        thought: "This sounds like a network connectivity issue. I'll classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I can't connect to the internet and the wifi isn't working",
        tool_output: MOCK_CLASSIFICATIONS.network_connectivity.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a network connectivity issue with high confidence. Let me fetch the appropriate solutions from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "network_connectivity",
          "description": "I can't connect to the internet and the wifi isn't working"
        },
        tool_output: [
          {
            "id": "KB-NET-001",
            "title": "Network troubleshooting guide",
            "content": "1. Check if other applications can connect to the internet\n2. Restart your device\n3. Reset your network adapter (see detailed instructions)\n4. Check if others in your area are experiencing issues\n5. Contact IT if problems persist",
            "relevance": 1.8
          },
          {
            "id": "KB-NET-003",
            "title": "Wi-Fi connectivity problems",
            "content": "To resolve Wi-Fi connectivity issues:\n1. Check if Wi-Fi is enabled on your device\n2. Forget the network and reconnect\n3. Move closer to the access point\n4. Restart your device and Wi-Fi router\n5. Try connecting to a different Wi-Fi network if available",
            "relevance": 1.9
          }
        ]
      },
      {
        step: 3,
        thought: "I now have the relevant troubleshooting steps from the knowledge base. I'll compose a response that provides actionable steps to resolve the WiFi connectivity issue."
      }
    ],
    response: "I understand you're having trouble connecting to the internet and your WiFi isn't working. Let me help you troubleshoot this network issue:\n\n1. First, check if WiFi is enabled on your device (look for a physical switch or function key)\n2. Try forgetting the network and reconnecting:\n   - Go to WiFi settings\n   - Find your network name\n   - Select 'Forget' or 'Remove'\n   - Then reconnect with the correct password\n3. Move closer to the WiFi router or access point to improve signal strength\n4. Restart both your device and the WiFi router (unplug the router, wait 30 seconds, then plug it back in)\n5. If possible, try connecting to a different WiFi network to determine if the issue is with your device or the network\n\nIf you've tried these steps and are still having problems, please let me know, and I can help escalate this to our network support team.",
    kb_articles: [
      {
        "id": "KB-NET-001",
        "title": "Network troubleshooting guide",
        "content": "1. Check if other applications can connect to the internet\n2. Restart your device\n3. Reset your network adapter (see detailed instructions)\n4. Check if others in your area are experiencing issues\n5. Contact IT if problems persist",
        "relevance": 1.8
      },
      {
        "id": "KB-NET-003",
        "title": "Wi-Fi connectivity problems",
        "content": "To resolve Wi-Fi connectivity issues:\n1. Check if Wi-Fi is enabled on your device\n2. Forget the network and reconnect\n3. Move closer to the access point\n4. Restart your device and Wi-Fi router\n5. Try connecting to a different Wi-Fi network if available",
        "relevance": 1.9
      }
    ]
  },
  
  hardware_failure: {
    steps: [
      {
        step: 1,
        thought: "This seems like a hardware issue. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "My computer screen is black and won't turn on",
        tool_output: MOCK_CLASSIFICATIONS.hardware_failure.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a hardware failure issue with high confidence. Let me fetch relevant solutions from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "hardware_failure",
          "description": "My computer screen is black and won't turn on"
        },
        tool_output: [
          {
            "id": "KB-HW-001",
            "title": "Hardware troubleshooting steps",
            "content": "1. Check all connections and cables\n2. Restart the device\n3. Verify power supply is functioning\n4. Run diagnostic tools if available\n5. If problem persists, contact IT support",
            "relevance": 1.5
          },
          {
            "id": "KB-HW-003",
            "title": "Monitor display issues",
            "content": "For monitor display problems:\n1. Check cable connections (power and video)\n2. Try a different cable if available\n3. Test with a different monitor or connect your monitor to a different computer\n4. Adjust resolution settings in Control Panel > Display\n5. Update graphics drivers",
            "relevance": 1.9
          }
        ]
      },
      {
        step: 3,
        thought: "Based on the knowledge base articles, I now have a good set of troubleshooting steps for this black screen issue. I'll provide a comprehensive response with actionable steps."
      }
    ],
    response: "I understand you're having an issue with your computer screen being black and not turning on. This appears to be a hardware issue. Here are some troubleshooting steps you can try:\n\n1. Check all cable connections to your monitor (both power and video cables)\n2. Try a different video cable if you have one available\n3. If possible, test with a different monitor or connect your monitor to a different computer to determine if the issue is with the monitor or the computer\n4. Make sure the power supply is functioning correctly\n5. If you can access the computer despite the monitor issue, try updating your graphics drivers\n\nIf none of these steps resolve the issue, it may require direct support from our IT team. Would you like me to escalate this to our hardware support specialists?",
    kb_articles: [
      {
        "id": "KB-HW-001",
        "title": "Hardware troubleshooting steps",
        "content": "1. Check all connections and cables\n2. Restart the device\n3. Verify power supply is functioning\n4. Run diagnostic tools if available\n5. If problem persists, contact IT support",
        "relevance": 1.5
      },
      {
        "id": "KB-HW-003",
        "title": "Monitor display issues",
        "content": "For monitor display problems:\n1. Check cable connections (power and video)\n2. Try a different cable if available\n3. Test with a different monitor or connect your monitor to a different computer\n4. Adjust resolution settings in Control Panel > Display\n5. Update graphics drivers",
        "relevance": 1.9
      }
    ]
  },
  
  printer_issues: {
    steps: [
      {
        step: 1,
        thought: "This seems like a printer issue. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I see a PC load letter error on my printer",
        tool_output: MOCK_CLASSIFICATIONS.printer_issues.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a printer issue with high confidence. Let me fetch the appropriate solutions from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "printer_issues",
          "description": "PC load letter error on printer"
        },
        tool_output: [
          {
            "id": "KB-PR-001",
            "title": "Common printer error messages",
            "content": "PC Load Letter error on most printers means the paper tray is empty or not detected correctly. To resolve:\n1. Check that the paper tray has paper loaded\n2. Ensure the paper is Letter size (or the correct size for your region)\n3. Remove and reinsert the paper tray to ensure it's properly seated\n4. Check for paper jams in the feed mechanism",
            "relevance": 1.9
          },
          {
            "id": "KB-PR-003",
            "title": "General printer troubleshooting",
            "content": "For general printer issues:\n1. Restart the printer (power off, wait 30 seconds, power on)\n2. Check printer connection (USB or network)\n3. Reinstall or update printer drivers\n4. Run the printer's self-test or maintenance routine\n5. Check for firmware updates for your printer model",
            "relevance": 1.2
          }
        ]
      },
      {
        step: 3,
        thought: "Now I have the specific information about the PC Load Letter error and general printer troubleshooting. I'll create a helpful response that addresses both the error message and potential blank page issues."
      }
    ],
    response: "I understand you're seeing a 'PC Load Letter' error on your Epson printer and getting blank pages when you print. This is a common printer issue that typically means the printer can't detect paper correctly or there's an issue with the paper tray. Here's how to fix it:\n\n1. First, check that the paper tray has paper loaded - this is the most common cause\n2. Make sure you're using the correct paper size (Letter size in the US, A4 in many other countries)\n3. Remove and reinsert the paper tray to ensure it's properly seated\n4. Look for any paper jams in the feed mechanism\n5. Try restarting the printer completely (power off, wait 30 seconds, power on)\n\nIf you're getting blank pages when printing, also check:\n- Ink or toner levels in your printer\n- Print head nozzles may be clogged (run the printer's cleaning utility)\n- Try printing a test page from the printer's control panel\n\nIf these steps don't resolve the issue, please let me know and I can help escalate this to our printer support specialists.",
    kb_articles: [
      {
        "id": "KB-PR-001",
        "title": "Common printer error messages",
        "content": "PC Load Letter error on most printers means the paper tray is empty or not detected correctly. To resolve:\n1. Check that the paper tray has paper loaded\n2. Ensure the paper is Letter size (or the correct size for your region)\n3. Remove and reinsert the paper tray to ensure it's properly seated\n4. Check for paper jams in the feed mechanism",
        "relevance": 1.9
      },
      {
        "id": "KB-PR-003",
        "title": "General printer troubleshooting",
        "content": "For general printer issues:\n1. Restart the printer (power off, wait 30 seconds, power on)\n2. Check printer connection (USB or network)\n3. Reinstall or update printer drivers\n4. Run the printer's self-test or maintenance routine\n5. Check for firmware updates for your printer model",
        "relevance": 1.2
      }
    ]
  },
  
  software_installation: {
    steps: [
      {
        step: 1,
        thought: "This appears to be about software installation. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I need to install Microsoft Office on my new laptop",
        tool_output: MOCK_CLASSIFICATIONS.software_installation.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a software installation issue with high confidence. Let me fetch the relevant information from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "software_installation",
          "description": "Installing Microsoft Office on new laptop"
        },
        tool_output: [
          {
            "id": "KB-SW-002",
            "title": "Standard software installation guide",
            "content": "To install standard software packages:\n1. Open the Company Portal app on your device\n2. Browse the available software catalog\n3. Find the software you need and click 'Install'\n4. Follow the on-screen prompts to complete installation\n5. For assistance, contact the Software Support Team at x5678",
            "relevance": 1.7
          },
          {
            "id": "KB-SW-005",
            "title": "Microsoft Office installation",
            "content": "For Microsoft Office installation:\n1. Go to portal.office.com\n2. Sign in with your company email and password\n3. Click 'Install Office' button at the top right\n4. Follow the download and installation instructions\n5. Activate using your company credentials when prompted",
            "relevance": 1.9
          }
        ]
      },
      {
        step: 3,
        thought: "I now have the specific instructions for installing Microsoft Office. I'll create a clear, step-by-step response based on the knowledge base articles."
      }
    ],
    response: "I can help you install Microsoft Office on your new laptop. There are two ways to do this:\n\nOption 1: Using the Office portal (recommended):\n1. Go to portal.office.com in your web browser\n2. Sign in with your company email and password\n3. Click the 'Install Office' button at the top right of the page\n4. Follow the download and installation instructions\n5. When prompted, activate using your company credentials\n\nOption 2: Using the Company Portal app:\n1. Open the Company Portal app on your laptop\n2. Browse the available software catalog\n3. Find Microsoft Office and click 'Install'\n4. Follow the on-screen prompts to complete installation\n\nThe installation process may take 15-20 minutes depending on your internet connection speed. If you encounter any issues during installation, please let me know, and I can provide additional troubleshooting steps.",
    kb_articles: [
      {
        "id": "KB-SW-002",
        "title": "Standard software installation guide",
        "content": "To install standard software packages:\n1. Open the Company Portal app on your device\n2. Browse the available software catalog\n3. Find the software you need and click 'Install'\n4. Follow the on-screen prompts to complete installation\n5. For assistance, contact the Software Support Team at x5678",
        "relevance": 1.7
      },
      {
        "id": "KB-SW-005",
        "title": "Microsoft Office installation",
        "content": "For Microsoft Office installation:\n1. Go to portal.office.com\n2. Sign in with your company email and password\n3. Click 'Install Office' button at the top right\n4. Follow the download and installation instructions\n5. Activate using your company credentials when prompted",
        "relevance": 1.9
      }
    ]
  },
  
  email_issues: {
    steps: [
      {
        step: 1,
        thought: "This appears to be an email issue. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I can't send or receive emails in Outlook",
        tool_output: MOCK_CLASSIFICATIONS.email_issues.results
      },
      {
        step: 2,
        thought: "The classification confirms this is an email issue with high confidence. Let me fetch relevant solutions from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "email_issues",
          "description": "Can't send or receive emails in Outlook"
        },
        tool_output: [
          {
            "id": "KB-EM-001",
            "title": "Outlook connectivity troubleshooting",
            "content": "If you can't send or receive emails in Outlook:\n1. Check your internet connection\n2. Verify Outlook is in online mode (File > Info > Work Offline should be unchecked)\n3. Restart Outlook\n4. Run the Outlook connectivity test (File > Info > Diagnostics > Test Email AutoConfiguration)\n5. Check for any large attachments in outbox that might be blocking the queue",
            "relevance": 1.9
          },
          {
            "id": "KB-EM-003",
            "title": "Common Outlook error resolutions",
            "content": "For common Outlook errors:\n1. Clear the Outlook cache (File > Account Settings > Account Settings > Email tab > double-click your account > clear the checkbox for 'Use Cached Exchange Mode')\n2. Create a new Outlook profile\n3. Check for Windows updates\n4. Run Outlook in safe mode (hold Ctrl while starting Outlook)\n5. Repair your Office installation (Control Panel > Programs > Programs and Features > Microsoft Office > Change > Repair)",
            "relevance": 1.7
          }
        ]
      },
      {
        step: 3,
        thought: "I have the necessary troubleshooting steps for Outlook email issues. I'll create a response with clear, actionable steps to resolve the problem."
      }
    ],
    response: "I understand you're having trouble sending and receiving emails in Outlook. Here are some troubleshooting steps you can try:\n\n1. First, check your internet connection - make sure you can access other websites\n2. Verify Outlook is in online mode:\n   - Go to File > Info and make sure \"Work Offline\" is unchecked\n3. Restart Outlook completely\n4. Check if there are any large attachments in your outbox that might be blocking the queue\n5. Clear the Outlook cache:\n   - Go to File > Account Settings > Account Settings\n   - On the Email tab, double-click your account\n   - Uncheck and then recheck \"Use Cached Exchange Mode\"\n   - Click Next > Done\n\nIf these steps don't solve the issue, you may need to try these more advanced solutions:\n1. Run Outlook in safe mode (hold Ctrl while starting Outlook)\n2. Repair your Office installation (Control Panel > Programs > Programs and Features > Microsoft Office > Change > Repair)\n\nLet me know if these steps help resolve your email issues, and if not, I can assist with escalating this to our email support team.",
    kb_articles: [
      {
        "id": "KB-EM-001",
        "title": "Outlook connectivity troubleshooting",
        "content": "If you can't send or receive emails in Outlook:\n1. Check your internet connection\n2. Verify Outlook is in online mode (File > Info > Work Offline should be unchecked)\n3. Restart Outlook\n4. Run the Outlook connectivity test (File > Info > Diagnostics > Test Email AutoConfiguration)\n5. Check for any large attachments in outbox that might be blocking the queue",
        "relevance": 1.9
      },
      {
        "id": "KB-EM-003",
        "title": "Common Outlook error resolutions",
        "content": "For common Outlook errors:\n1. Clear the Outlook cache (File > Account Settings > Account Settings > Email tab > double-click your account > clear the checkbox for 'Use Cached Exchange Mode')\n2. Create a new Outlook profile\n3. Check for Windows updates\n4. Run Outlook in safe mode (hold Ctrl while starting Outlook)\n5. Repair your Office installation (Control Panel > Programs > Programs and Features > Microsoft Office > Change > Repair)",
        "relevance": 1.7
      }
    ]
  },
  
  access_permission: {
    steps: [
      {
        step: 1,
        thought: "This sounds like an access permission issue. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I need access to the marketing shared drive",
        tool_output: MOCK_CLASSIFICATIONS.access_permission.results
      },
      {
        step: 2,
        thought: "The classification confirms this is an access permission issue with high confidence. Let me fetch the appropriate solutions from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "access_permission",
          "description": "Need access to marketing shared drive"
        },
        tool_output: [
          {
            "id": "KB-AC-001",
            "title": "Requesting access to shared resources",
            "content": "To request access to shared drives and resources:\n1. Submit a request through the Access Management Portal at access.company.com\n2. Select 'Request New Access' and choose the resource type\n3. Provide business justification for the access\n4. Obtain manager approval through the automated workflow\n5. Allow 1-2 business days for processing",
            "relevance": 1.9
          },
          {
            "id": "KB-AC-004",
            "title": "Shared drive troubleshooting",
            "content": "If you're having issues accessing a shared drive you should have access to:\n1. Check if you can access other network resources\n2. Try mapping the drive again using the correct UNC path\n3. Verify your credentials by logging out and back in\n4. Contact the resource owner to confirm you have been added to the correct group\n5. For immediate assistance, contact the Service Desk",
            "relevance": 1.4
          }
        ]
      },
      {
        step: 3,
        thought: "I have the information needed to guide the user through the access request process. I'll create a clear response with the steps they need to follow to get access to the marketing shared drive."
      }
    ],
    response: "I understand you need access to the marketing shared drive. Here's how to request this access:\n\n1. Go to the Access Management Portal at access.company.com\n2. Log in with your company credentials\n3. Click 'Request New Access'\n4. From the resource type dropdown, select 'Shared Drive'\n5. In the specific resource field, enter 'Marketing Shared Drive'\n6. Provide a business justification explaining why you need this access\n7. Submit the request - this will automatically be sent to your manager for approval\n\nThe typical processing time is 1-2 business days after manager approval. You'll receive an email notification once access has been granted.\n\nIf you need urgent access, please let me know, and I can help escalate your request to the appropriate team.",
    kb_articles: [
      {
        "id": "KB-AC-001",
        "title": "Requesting access to shared resources",
        "content": "To request access to shared drives and resources:\n1. Submit a request through the Access Management Portal at access.company.com\n2. Select 'Request New Access' and choose the resource type\n3. Provide business justification for the access\n4. Obtain manager approval through the automated workflow\n5. Allow 1-2 business days for processing",
        "relevance": 1.9
      },
      {
        "id": "KB-AC-004",
        "title": "Shared drive troubleshooting",
        "content": "If you're having issues accessing a shared drive you should have access to:\n1. Check if you can access other network resources\n2. Try mapping the drive again using the correct UNC path\n3. Verify your credentials by logging out and back in\n4. Contact the resource owner to confirm you have been added to the correct group\n5. For immediate assistance, contact the Service Desk",
        "relevance": 1.4
      }
    ]
  },
  
  security_incident: {
    steps: [
      {
        step: 1,
        thought: "This sounds like a potential security incident. Let me classify it to confirm.",
        tool: "classify_issue",
        tool_input: "I think my account has been hacked, I'm seeing suspicious emails being sent from my account",
        tool_output: MOCK_CLASSIFICATIONS.security_incident.results
      },
      {
        step: 2,
        thought: "The classification confirms this is a security incident with high confidence. This is a high-priority issue that needs immediate attention. Let me fetch the relevant security procedures from the knowledge base.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "security_incident",
          "description": "Account compromised, suspicious emails being sent"
        },
        tool_output: [
          {
            "id": "KB-SEC-001",
            "title": "Security incident response protocol",
            "content": "For suspected security incidents:\n1. Immediately report the incident to the Security Response Team at security@company.com or call the emergency hotline at x9999\n2. Do not turn off your device or delete suspicious items as they may contain evidence\n3. Disconnect your device from the network by disabling WiFi and unplugging ethernet\n4. Document any suspicious behavior or messages\n5. Follow instructions from the Security Team - do not attempt to fix the issue yourself",
            "relevance": 1.9
          },
          {
            "id": "KB-SEC-005",
            "title": "Account compromise procedures",
            "content": "If you suspect your account has been compromised:\n1. Report immediately to IT Security (x9999)\n2. Change passwords on any other accounts that share the same password\n3. Check security events in your account if possible\n4. Look for unauthorized email rules, forwards, or delegates\n5. Monitor your accounts for additional suspicious activity",
            "relevance": 1.8
          }
        ]
      },
      {
        step: 3,
        thought: "This is a high-priority security incident that requires immediate escalation. I'll create a response that emphasizes the urgency while providing clear steps for the user to take.",
        tool: "escalate_ticket",
        tool_input: {
          "issue_type": "security_incident",
          "description": "User reporting suspicious emails sent from their account - potential account compromise",
          "priority": "high"
        },
        tool_output: {
          "ticket_id": "SEC-2023-05-18-001",
          "escalated_to": "Security Response Team",
          "priority": "high",
          "estimated_response_time": "30 minutes"
        }
      },
      {
        step: 4,
        thought: "I've escalated this to the Security Response Team for immediate attention. Now I'll provide the user with a response that includes both immediate steps to take and information about the escalation."
      }
    ],
    response: "I understand your account may have been compromised with suspicious emails being sent. This is a security incident that requires immediate attention. I've escalated this to our Security Response Team (ticket SEC-2023-05-18-001) who will contact you within 30 minutes.\n\nIn the meantime, please take these immediate actions:\n\n1. Do NOT turn off your device or delete the suspicious emails (they may contain evidence)\n2. Disconnect your device from the network:\n   - Disable WiFi and unplug any ethernet cable\n   - Keep your device powered on\n3. If you used this password elsewhere, use a separate device to change those passwords immediately\n4. Document any suspicious activity you've noticed\n\nThe Security Response Team will contact you shortly with further instructions. This is being treated as a high-priority incident.",
    kb_articles: [
      {
        "id": "KB-SEC-001",
        "title": "Security incident response protocol",
        "content": "For suspected security incidents:\n1. Immediately report the incident to the Security Response Team at security@company.com or call the emergency hotline at x9999\n2. Do not turn off your device or delete suspicious items as they may contain evidence\n3. Disconnect your device from the network by disabling WiFi and unplugging ethernet\n4. Document any suspicious behavior or messages\n5. Follow instructions from the Security Team - do not attempt to fix the issue yourself",
        "relevance": 1.9
      },
      {
        "id": "KB-SEC-005",
        "title": "Account compromise procedures",
        "content": "If you suspect your account has been compromised:\n1. Report immediately to IT Security (x9999)\n2. Change passwords on any other accounts that share the same password\n3. Check security events in your account if possible\n4. Look for unauthorized email rules, forwards, or delegates\n5. Monitor your accounts for additional suspicious activity",
        "relevance": 1.8
      }
    ]
  },
  
  general: {
    steps: [
      {
        step: 1,
        thought: "I need to determine what type of issue this is. Let me classify it first.",
        tool: "classify_issue",
        tool_input: "I'm having an IT problem",
        tool_output: MOCK_CLASSIFICATIONS.general.results
      },
      {
        step: 2,
        thought: "The classification doesn't provide a clear category. I need more specific information to help effectively.",
        tool: "fetch_kb_solution",
        tool_input: {
          "issue_type": "other",
          "description": "general IT problem"
        },
        tool_output: [
          {
            "id": "KB-GEN-001",
            "title": "General IT support",
            "content": "For issues not covered by our knowledge base, please provide more specific details about your problem such as error messages, what you were trying to do, and which systems or applications are involved.",
            "relevance": 1.3
          }
        ]
      },
      {
        step: 3,
        thought: "I don't have enough specific information to provide a targeted solution. I'll ask the user for more details about their IT problem."
      }
    ],
    response: "I'd be happy to help with your IT problem. To provide the most effective assistance, I'll need some more specific details about the issue you're experiencing. Could you please share:\n\n1. A more detailed description of the problem\n2. Any error messages you're seeing\n3. Which system, application, or device you're having trouble with\n4. What you were trying to do when the problem occurred\n\nWith this additional information, I'll be able to diagnose your issue more accurately and provide appropriate solutions.",
    kb_articles: [
      {
        "id": "KB-GEN-001",
        "title": "General IT support",
        "content": "For issues not covered by our knowledge base, please provide more specific details about your problem such as error messages, what you were trying to do, and which systems or applications are involved.",
        "relevance": 1.3
      }
    ]
  }
};

// Helper function to determine which mock response to use based on keywords
export function determineIssueType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Printer related keywords
  if (lowerMessage.includes('printer') || lowerMessage.includes('print') || 
      lowerMessage.includes('paper') || lowerMessage.includes('toner') ||
      lowerMessage.includes('ink') || lowerMessage.includes('cartridge') ||
      lowerMessage.includes('pc load letter') || lowerMessage.includes('epson')) {
    return 'printer_issues';
  } 
  // Password related keywords
  else if (lowerMessage.includes('password') || lowerMessage.includes('forgot') || 
           lowerMessage.includes('login') || lowerMessage.includes('can\'t log in') ||
           lowerMessage.includes('account') && lowerMessage.includes('access')) {
    return 'password_reset';
  } 
  // Hardware related keywords
  else if (lowerMessage.includes('screen') || lowerMessage.includes('monitor') || 
           lowerMessage.includes('computer') || lowerMessage.includes('hardware') || 
           lowerMessage.includes('black screen') || lowerMessage.includes('won\'t turn on')) {
    return 'hardware_failure';
  } 
  // Network related keywords
  else if (lowerMessage.includes('internet') || lowerMessage.includes('wifi') || 
           lowerMessage.includes('network') || lowerMessage.includes('connect') || 
           lowerMessage.includes('offline') || lowerMessage.includes('no connection')) {
    return 'network_connectivity';
  } 
  // Software related keywords
  else if (lowerMessage.includes('install') || lowerMessage.includes('software') || 
           lowerMessage.includes('download') || lowerMessage.includes('update') || 
           lowerMessage.includes('office') || lowerMessage.includes('windows') ||
           lowerMessage.includes('application')) {
    return 'software_installation';
  } 
  // Email related keywords
  else if (lowerMessage.includes('email') || lowerMessage.includes('outlook') || 
           lowerMessage.includes('mail') || lowerMessage.includes('message') || 
           lowerMessage.includes('inbox') || lowerMessage.includes('send') && lowerMessage.includes('receive')) {
    return 'email_issues';
  } 
  // Access related keywords
  else if (lowerMessage.includes('access') || lowerMessage.includes('permission') || 
           lowerMessage.includes('can\'t open') || lowerMessage.includes('restricted') || 
           lowerMessage.includes('denied') || lowerMessage.includes('shared drive') ||
           lowerMessage.includes('folder') && lowerMessage.includes('access')) {
    return 'access_permission';
  } 
  // Security related keywords
  else if (lowerMessage.includes('hack') || lowerMessage.includes('suspicious') || 
           lowerMessage.includes('security') || lowerMessage.includes('breach') || 
           lowerMessage.includes('compromise') || lowerMessage.includes('virus') ||
           lowerMessage.includes('malware')) {
    return 'security_incident';
  } 
  // Default response if no keywords match
  else {
    return 'general';
  }
}

// Generate a mock trace based on the issue type
export function generateMockTrace(userMessage: string): Trace {
  const issueType = determineIssueType(userMessage);
  const mockResponse = MOCK_RESPONSES[issueType];
  const traceId = generateMockTraceId();
  
  return {
    id: traceId,
    timestamp: new Date().toISOString(),
    input: userMessage,
    final_output: mockResponse.response,
    completed: true,
    steps: mockResponse.steps,
    classification: MOCK_CLASSIFICATIONS[issueType]
  };
}

// Generate a mock response for the API based on user message
export function generateMockApiResponse(userMessage: string) {
  const issueType = determineIssueType(userMessage);
  const mockResponse = MOCK_RESPONSES[issueType];
  const traceId = generateMockTraceId();
  
  return {
    trace_id: traceId,
    response: mockResponse.response,
    reasoning: mockResponse.steps,
    completed: true,
    classification: MOCK_CLASSIFICATIONS[issueType]
  };
}

// Generate a list of traces for the trace viewer
export function generateMockTraceList(count: number = 10): any[] {
  const traces = [];
  const issueTypes = Object.keys(MOCK_RESPONSES);
  
  for (let i = 0; i < count; i++) {
    // Pick a random issue type
    const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
    const mockResponse = MOCK_RESPONSES[issueType];
    
    // Generate a sample user input based on the issue type
    let input = "";
    switch (issueType) {
      case "password_reset":
        input = "I forgot my password and can't log in";
        break;
      case "network_connectivity":
        input = "My internet connection keeps dropping";
        break;
      case "hardware_failure":
        input = "My computer won't turn on";
        break;
      case "printer_issues":
        input = "My printer says PC Load Letter and won't print";
        break;
      case "software_installation":
        input = "I need help installing the new software";
        break;
      case "email_issues":
        input = "I can't send emails from Outlook";
        break;
      case "access_permission":
        input = "I need access to the marketing folder";
        break;
      case "security_incident":
        input = "I think my account has been hacked";
        break;
      default:
        input = "I'm having an IT problem";
    }
    
    traces.push({
      id: `mock-${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(), // Spread out over last few hours
      input_preview: input,
      completed: Math.random() > 0.1 // 90% complete, 10% in progress
    });
  }
  
  return traces;
}